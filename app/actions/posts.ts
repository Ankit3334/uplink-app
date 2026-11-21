"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type TransmitPostState = {
  error?: string;
};

export type UploadReelState = {
  error?: string;
};

export type AddThreadState = {
  error?: string;
};

export type EditPostState = {
  error?: string;
  success?: boolean;
};

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

    const captionRaw = formData.get("caption");
    const caption = typeof captionRaw === "string" ? captionRaw.trim() : "";
    const bodyRaw = formData.get("body");
    const bodyText = typeof bodyRaw === "string" ? bodyRaw.trim() : "";
    const linkRaw = formData.get("link");
    const link = typeof linkRaw === "string" ? linkRaw.trim() : "";

    // TEXT post
    if (mode === "text") {
      const composedBody = [bodyText, link].filter(Boolean).join("\n\n");
      if (!composedBody) {
        return { error: "TRANSMISSION FAILED: Text payload empty." };
      }

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: null,
        body: composedBody,
        caption: caption || null,
      });

      if (insertError) {
        return { error: `TRANSMISSION FAILED: ${insertError.message}` };
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
    });

    if (insertError) {
      await supabase.storage.from("uplink-posts").remove([filename]);
      return { error: `TRANSMISSION FAILED: ${insertError.message}` };
    }

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "TRANSMISSION FAILED: Unexpected system error." };
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

export async function toggleReelBoost(
  reelId: string,
): Promise<{ boosted: boolean; boostCount: number; error?: string }> {
  if (!reelId) return { boosted: false, boostCount: 0, error: "Missing reel." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { boosted: false, boostCount: 0, error: "Authentication required." };

  const { data: existing } = await supabase
    .from("reel_boosts")
    .select("id")
    .eq("user_id", user.id)
    .eq("reel_id", reelId)
    .maybeSingle();

  let boosted = false;
  if (existing) {
    await supabase.from("reel_boosts").delete().eq("id", existing.id).eq("user_id", user.id);
    boosted = false;
  } else {
    const { error } = await supabase.from("reel_boosts").insert({ user_id: user.id, reel_id: reelId });
    boosted = !error;
  }

  // Keep reels.boost_count in sync (best-effort count)
  const { count } = await supabase
    .from("reel_boosts")
    .select("id", { count: "exact", head: true })
    .eq("reel_id", reelId);
  const boostCount = count ?? 0;
  await supabase.from("reels").update({ boost_count: boostCount }).eq("id", reelId);

  revalidatePath("/reels");
  return { boosted, boostCount };
}

export async function toggleReelBookmark(
  reelId: string,
): Promise<{ bookmarked: boolean; error?: string }> {
  if (!reelId) return { bookmarked: false, error: "Missing reel." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookmarked: false, error: "Authentication required." };

  const { data: existing } = await supabase
    .from("reel_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("reel_id", reelId)
    .maybeSingle();

  let bookmarked = false;
  if (existing) {
    await supabase.from("reel_bookmarks").delete().eq("id", existing.id).eq("user_id", user.id);
    bookmarked = false;
  } else {
    const { error } = await supabase.from("reel_bookmarks").insert({ user_id: user.id, reel_id: reelId });
    bookmarked = !error;
  }

  revalidatePath("/reels");
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

    if (typeof postId !== "string" || !postId) {
      return { error: "THREAD INJECTION FAILED: Missing post reference." };
    }

    if (!content) {
      return { error: "THREAD INJECTION FAILED: Payload empty." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth");
    }

    const { error: insertError } = await supabase.from("threads").insert({
      user_id: user.id,
      post_id: postId,
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

export async function uploadReel(
  _prevState: UploadReelState,
  formData: FormData,
): Promise<UploadReelState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "TRANSMISSION FAILED: Authentication required." };
    }

    const file = formData.get("video");
    const captionRaw = formData.get("caption");
    const caption = typeof captionRaw === "string" ? captionRaw.trim() : "";

    if (!(file instanceof File) || file.size === 0) {
      return { error: "TRANSMISSION FAILED: No video payload detected." };
    }

    if (!file.type.startsWith("video/")) {
      return { error: "TRANSMISSION FAILED: Payload must be a video file." };
    }

    const ext = "mp4";
    const filename = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("reel-videos")
      .upload(filename, file, {
        contentType: file.type || "video/mp4",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `TRANSMISSION FAILED: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("reel-videos").getPublicUrl(filename);

    const { error: insertError } = await supabase.from("reels").insert({
      user_id: user.id,
      video_url: publicUrl,
      caption: caption || null,
    });

    if (insertError) {
      await supabase.storage.from("reel-videos").remove([filename]);
      return { error: `TRANSMISSION FAILED: ${insertError.message}` };
    }

    revalidatePath("/reels");
    revalidatePath("/");
    redirect("/reels");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "TRANSMISSION FAILED: Unexpected system error." };
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
