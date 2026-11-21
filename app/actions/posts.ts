"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type TransmitPostState = {
  error?: string;
};

export type AddThreadState = {
  error?: string;
};

export async function transmitPost(
  _prevState: TransmitPostState,
  formData: FormData,
): Promise<TransmitPostState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "TRANSMISSION FAILED: Authentication required." };
  }

  const file = formData.get("image");
  const captionRaw = formData.get("caption");
  const caption = typeof captionRaw === "string" ? captionRaw.trim() : "";

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
    caption: caption || null,
  });

  if (insertError) {
    await supabase.storage.from("uplink-posts").remove([filename]);
    return { error: `TRANSMISSION FAILED: ${insertError.message}` };
  }

  revalidatePath("/");
  redirect("/");
}

export async function toggleBoost(formData: FormData): Promise<void> {
  const postId = formData.get("postId");
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

  const { data: existingBoost, error: existingError } = await supabase
    .from("boosts")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existingError) {
    return;
  }

  if (existingBoost) {
    const { error: deleteError } = await supabase
      .from("boosts")
      .delete()
      .eq("id", existingBoost.id)
      .eq("user_id", user.id);

    if (deleteError) {
      return;
    }

    const { error: rpcError } = await supabase.rpc("adjust_post_boost_count", {
      p_post_id: postId,
      p_delta: -1,
    });

    if (rpcError) {
      // Fallback: may fail under RLS if user is not post owner; count kept best-effort.
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
    const { error: insertError } = await supabase.from("boosts").insert({
      user_id: user.id,
      post_id: postId,
    });

    if (insertError) {
      return;
    }

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
  }

  revalidatePath("/");
}

export async function addThread(
  _prevState: AddThreadState,
  formData: FormData,
): Promise<AddThreadState> {
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
    // Best-effort fallback if RPC is unavailable in the environment.
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

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  redirect(`/post/${postId}`);
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
