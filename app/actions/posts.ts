"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadFeedPage, type FeedPageResult } from "@/src/lib/feed";
import { feedTabForCategory, type FeedTabValue } from "@/src/lib/post-categories";
import { createClient } from "@/src/lib/supabase/server";
import { stripCodeFences } from "@/src/lib/utils";

export type TransmitPostState = {
  error?: string;
};

export type AddThreadState = {
  error?: string;
};

export type VotePollResult = {
  success: boolean;
  optionId?: string;
  voteCounts?: Record<string, number>;
  alreadyVoted?: boolean;
  error?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type EditPostState = {
  error?: string;
  success?: boolean;
};

export type PinPostResult = {
  pinned: boolean;
  pinnedPostId: string | null;
  previousPinnedPostId?: string | null;
  error?: string;
};

/** Feature one of the caller's own posts on their profile. */
export async function pinPost(postId: string): Promise<PinPostResult> {
  if (!UUID_PATTERN.test(postId)) {
    return { pinned: false, pinnedPostId: null, error: "Invalid post reference." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { pinned: false, pinnedPostId: null, error: "Authentication required." };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.user_id !== user.id) {
    return { pinned: false, pinnedPostId: null, error: "Not authorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { pinned: false, pinnedPostId: null, error: "Profile not found." };
  }

  const previousPinnedPostId = (profile.pinned_post_id as string | null) ?? null;
  const nextPinnedPostId = previousPinnedPostId === postId ? null : postId;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ pinned_post_id: nextPinnedPostId })
    .eq("id", user.id);

  if (updateError) {
    return {
      pinned: previousPinnedPostId === postId,
      pinnedPostId: previousPinnedPostId,
      error: `PIN FAILED: ${updateError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/post/${postId}`);
  if (previousPinnedPostId && previousPinnedPostId !== postId) {
    revalidatePath(`/post/${previousPinnedPostId}`);
  }
  if (profile.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return {
    pinned: nextPinnedPostId !== null,
    pinnedPostId: nextPinnedPostId,
    previousPinnedPostId,
  };
}

/** Read-only feed action used by the infinite-scroll trigger. */
export async function getFeedPosts({
  cursor,
  category,
}: {
  cursor?: string | null;
  category?: FeedTabValue;
}): Promise<FeedPageResult> {
  const safeCursor = cursor && UUID_PATTERN.test(cursor) ? cursor : null;
  return loadFeedPage({
    cursor: safeCursor,
    category: feedTabForCategory(category),
  });
}

export async function transmitPost(
  _prevState: TransmitPostState,
  formData: FormData,
): Promise<TransmitPostState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "TRANSMISSION FAILED: Authentication required." };
    }

    const modeRaw = formData.get("mode");
    const mode = typeof modeRaw === "string" ? modeRaw : "image";

    const categoryRaw = formData.get("category");
    const category =
      typeof categoryRaw === "string" &&
      ["general", "question", "hiring", "showdev"].includes(categoryRaw)
        ? categoryRaw
        : "general";

    const captionRaw = formData.get("caption");
    const caption = typeof captionRaw === "string" ? captionRaw.trim() : "";
    const bodyRaw = formData.get("body");
    const bodyText = typeof bodyRaw === "string" ? bodyRaw.trim() : "";
    const linkRaw = formData.get("link");
    const link = typeof linkRaw === "string" ? linkRaw.trim() : "";
    const isCodeBlockRaw = formData.get("is_code_block");
    const isCodeBlock = isCodeBlockRaw === "true" || isCodeBlockRaw === "on";
    const languageRaw = formData.get("language");
    const codeLanguage =
      typeof languageRaw === "string" && languageRaw.trim()
        ? languageRaw.trim().slice(0, 32)
        : null;

    const seenPollOptions = new Set<string>();
    const pollOptions = formData
      .getAll("pollOptions")
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((value) => value.slice(0, 120))
      .filter((value) => {
        const key = value.toLowerCase();
        if (seenPollOptions.has(key)) return false;
        seenPollOptions.add(key);
        return true;
      });

    const pollEnabledRaw = formData.get("poll_enabled");
    const pollEnabled = pollEnabledRaw === "true" || pollEnabledRaw === "on";
    if (pollEnabled && pollOptions.length < 2) {
      return { error: "TRANSMISSION FAILED: A poll needs at least 2 options." };
    }

    // TEXT post (plain signal or code snippet)
    if (mode === "text") {
      const storedBody = isCodeBlock ? stripCodeFences(bodyText) : bodyText;
      const composedBody = [
        storedBody,
        isCodeBlock ? "" : link,
      ]
        .filter(Boolean)
        .join("\n\n");
      if (!composedBody) {
        return { error: "TRANSMISSION FAILED: Text payload empty." };
      }

      // Explicit defaults keep inserts valid even when a column was recently
      // added and the database has not backfilled a default for old rows.
      const { data: insertedPost, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          image_url: null,
          body: composedBody,
          caption: caption || null,
          category,
          is_code_block: isCodeBlock,
          language: isCodeBlock ? codeLanguage : null,
        })
        .select("id")
        .single();

      if (insertError || !insertedPost) {
        return {
          error: `TRANSMISSION FAILED: ${insertError?.message ?? "Post insert failed."}`,
        };
      }

      if (pollEnabled && pollOptions.length > 0) {
        const { data: poll, error: pollError } = await supabase
          .from("polls")
          .insert({ post_id: insertedPost.id, ends_at: null })
          .select("id")
          .single();

        if (pollError || !poll) {
          await supabase.from("posts").delete().eq("id", insertedPost.id);
          return {
            error: `TRANSMISSION FAILED: ${pollError?.message ?? "Poll insert failed."}`,
          };
        }

        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(
            pollOptions.map((option_text) => ({
              poll_id: poll.id,
              option_text,
            })),
          );

        if (optionsError) {
          await supabase.from("polls").delete().eq("id", poll.id);
          await supabase.from("posts").delete().eq("id", insertedPost.id);
          return {
            error: `TRANSMISSION FAILED: ${optionsError.message}`,
          };
        }
      }

      revalidatePath("/");
      redirect("/");
    }

    // IMAGE post
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "TRANSMISSION FAILED: No image payload detected." };
    }

    if (!file.type.startsWith("image/")) {
      return { error: "TRANSMISSION FAILED: Payload must be an image file." };
    }

    const filename = `${user.id}_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("uplink-posts")
      .upload(filename, file, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `TRANSMISSION FAILED: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("uplink-posts").getPublicUrl(filename);

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      image_url: publicUrl,
      body: bodyText || null,
      caption: caption || null,
      category,
      is_code_block: false,
      language: null,
    });

    if (insertError) {
      await supabase.storage.from("uplink-posts").remove([filename]);
      return { error: `TRANSMISSION FAILED: ${insertError.message}` };
    }

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    // Next.js implements redirect() by throwing; let it through so navigation
    // still works after a successful upload. Everything else is a soft error.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Failed to upload" };
  }
}

export type ToggleBoostResult = {
  boosted: boolean;
  boostCount: number;
  error?: string;
};

export async function toggleBoostPost(postId: string): Promise<ToggleBoostResult> {
  if (!postId) {
    return { boosted: false, boostCount: 0, error: "Missing post." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { boosted: false, boostCount: 0, error: "Authentication required." };
  }

  const { data: existingBoost } = await supabase
    .from("boosts")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  let boosted = false;

  if (existingBoost) {
    const { error: deleteError } = await supabase
      .from("boosts")
      .delete()
      .eq("id", existingBoost.id)
      .eq("user_id", user.id);

    if (!deleteError) {
      boosted = false;
      const { error: rpcError } = await supabase.rpc("adjust_post_boost_count", {
        p_post_id: postId,
        p_delta: -1,
      });
      if (rpcError) {
        const { data: post } = await supabase
          .from("posts")
          .select("boost_count")
          .eq("id", postId)
          .maybeSingle();
        if (post) {
          await supabase
            .from("posts")
            .update({ boost_count: Math.max((post.boost_count ?? 1) - 1, 0) })
            .eq("id", postId);
        }
      }
    } else {
      boosted = true;
    }
  } else {
    const { error: insertError } = await supabase.from("boosts").insert({
      user_id: user.id,
      post_id: postId,
    });

    if (!insertError) {
      boosted = true;
      const { error: rpcError } = await supabase.rpc("adjust_post_boost_count", {
        p_post_id: postId,
        p_delta: 1,
      });
      if (rpcError) {
        const { data: post } = await supabase
          .from("posts")
          .select("boost_count")
          .eq("id", postId)
          .maybeSingle();
        if (post) {
          await supabase
            .from("posts")
            .update({ boost_count: (post.boost_count ?? 0) + 1 })
            .eq("id", postId);
        }
      }

      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .maybeSingle();
      if (post?.user_id && post.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: user.id,
          type: "boost",
          post_id: postId,
        });
      }
    }
  }

  const { data: postRow } = await supabase
    .from("posts")
    .select("boost_count")
    .eq("id", postId)
    .maybeSingle();

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  revalidatePath("/notifications");

  return {
    boosted,
    boostCount: postRow?.boost_count ?? 0,
  };
}

export async function toggleBoost(formData: FormData): Promise<void> {
  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) return;
  await toggleBoostPost(postId);
}

export type ToggleBookmarkResult = {
  bookmarked: boolean;
  error?: string;
};

export async function toggleBookmark(postId: string): Promise<ToggleBookmarkResult> {
  if (!postId) return { bookmarked: false, error: "Missing post." };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { bookmarked: false, error: "Authentication required." };
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  let bookmarked = false;
  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);
    bookmarked = Boolean(error);
  } else {
    const { error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      post_id: postId,
    });
    bookmarked = !error;
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  revalidatePath("/profile");

  return { bookmarked };
}

export async function addThread(
  _prevState: AddThreadState,
  formData: FormData,
): Promise<AddThreadState> {
  try {
    const postId = formData.get("postId");
    const contentRaw = formData.get("content");
    const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
    const parentIdRaw = formData.get("parentId");
    const parentId =
      typeof parentIdRaw === "string" && parentIdRaw.trim()
        ? parentIdRaw.trim()
        : null;

    if (typeof postId !== "string" || !postId) {
      return { error: "THREAD INJECTION FAILED: Missing post reference." };
    }

    if (!content) {
      return { error: "THREAD INJECTION FAILED: Payload empty." };
    }

    if (parentId && !UUID_PATTERN.test(parentId)) {
      return { error: "THREAD INJECTION FAILED: Invalid parent thread." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth");
    }

    let rootParentId: string | null = null;
    if (parentId) {
      const { data: parentThread, error: parentError } = await supabase
        .from("threads")
        .select("id, post_id, parent_id")
        .eq("id", parentId)
        .maybeSingle();

      if (parentError || !parentThread || parentThread.post_id !== postId) {
        return { error: "THREAD INJECTION FAILED: Invalid parent thread." };
      }

      // Keep the tree one level deep: replying to a reply targets its root.
      rootParentId = parentThread.parent_id ?? parentThread.id;
    }

    const { error: insertError } = await supabase.from("threads").insert({
      user_id: user.id,
      post_id: postId,
      parent_id: rootParentId,
      content,
    });

    if (insertError) {
      return { error: `THREAD INJECTION FAILED: ${insertError.message}` };
    }

    const { error: rpcError } = await supabase.rpc("adjust_post_thread_count", {
      p_post_id: postId,
      p_delta: 1,
    });

    if (rpcError) {
      const { data: post } = await supabase
        .from("posts")
        .select("thread_count")
        .eq("id", postId)
        .maybeSingle();
      if (post) {
        await supabase
          .from("posts")
          .update({ thread_count: (post.thread_count ?? 0) + 1 })
          .eq("id", postId);
      }
    }

    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .maybeSingle();
    if (post?.user_id && post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        type: "thread",
        post_id: postId,
      });
      revalidatePath("/notifications");
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    redirect(`/post/${postId}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "THREAD INJECTION FAILED: Unexpected system error." };
  }
}

export async function voteInPoll({
  pollId,
  optionId,
}: {
  pollId: string;
  optionId: string;
}): Promise<VotePollResult> {
  if (!UUID_PATTERN.test(pollId) || !UUID_PATTERN.test(optionId)) {
    return { success: false, error: "Invalid poll reference." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: existingVote } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVote) {
    const { data: poll } = await supabase
      .from("polls")
      .select("post_id, poll_options(id, vote_count)")
      .eq("id", pollId)
      .maybeSingle();

    const options = Array.isArray(poll?.poll_options)
      ? poll.poll_options
      : poll?.poll_options
        ? [poll.poll_options]
        : [];

    return {
      success: true,
      alreadyVoted: true,
      optionId: existingVote.option_id as string,
      voteCounts: Object.fromEntries(
        options.map((option) => [option.id as string, Number(option.vote_count ?? 0)]),
      ),
      error: "You already voted in this poll.",
    };
  }

  try {
    const { data, error: rpcError } = await supabase.rpc("cast_poll_vote", {
      p_poll_id: pollId,
      p_option_id: optionId,
      p_user_id: user.id,
    });

    if (rpcError) {
      return { success: false, error: `VOTE FAILED: ${rpcError.message}` };
    }

    const result = data as {
      already_voted?: boolean;
      option_id?: string;
      post_id?: string;
      counts?: Record<string, number>;
    } | null;

    const postId = result?.post_id;
    if (postId) {
      revalidatePath("/");
      revalidatePath(`/post/${postId}`);
    }

    return {
      success: true,
      alreadyVoted: Boolean(result?.already_voted),
      optionId: result?.option_id ?? optionId,
      voteCounts: result?.counts,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? `VOTE FAILED: ${error.message}` : "VOTE FAILED.",
    };
  }
}

export async function editPost(
  _prevState: EditPostState,
  formData: FormData,
): Promise<EditPostState> {
  try {
    const postId = formData.get("postId");
    const bodyRaw = formData.get("body");
    const body = typeof bodyRaw === "string" ? bodyRaw.trim() : "";

    if (typeof postId !== "string" || !postId) {
      return { error: "EDIT FAILED: Missing post reference." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "EDIT FAILED: Authentication required." };
    }

    const { data: post } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .maybeSingle();

    if (!post || post.user_id !== user.id) {
      return { error: "EDIT FAILED: Not authorized." };
    }

    const { error } = await supabase
      .from("posts")
      .update({
        body: body || null,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      return { error: `EDIT FAILED: ${error.message}` };
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "EDIT FAILED: Unexpected system error." };
  }
}

export async function deletePost(formData: FormData): Promise<void> {
  const postId = formData.get("postId");
  const redirectToRaw = formData.get("redirectTo");
  const redirectTo =
    typeof redirectToRaw === "string" && redirectToRaw.startsWith("/")
      ? redirectToRaw
      : null;

  if (typeof postId !== "string" || !postId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.user_id !== user.id) {
    return;
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    return;
  }

  revalidatePath("/");
  revalidatePath("/profile");

  if (redirectTo) {
    redirect(redirectTo);
  }
}
