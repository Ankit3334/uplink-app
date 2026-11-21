"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type UploadStoryState = {
  error?: string;
  success?: number;
};

export async function uploadStory(
  _prevState: UploadStoryState,
  formData: FormData,
): Promise<UploadStoryState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "BROADCAST FAILED: Authentication required." };
  }

  const file = formData.get("media");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "BROADCAST FAILED: No media payload detected." };
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return { error: "BROADCAST FAILED: Payload must be an image or video." };
  }

  const mediaType = isImage ? "image" : "video";
  const ext = isImage ? "jpg" : "mp4";
  const filename = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("story-media")
    .upload(filename, file, {
      contentType: file.type || (isImage ? "image/jpeg" : "video/mp4"),
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: `BROADCAST FAILED: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("story-media").getPublicUrl(filename);

  const { error: insertError } = await supabase.from("stories").insert({
    user_id: user.id,
    media_url: publicUrl,
    media_type: mediaType,
  });

  if (insertError) {
    await supabase.storage.from("story-media").remove([filename]);
    return { error: `BROADCAST FAILED: ${insertError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/broadcasts");
  return { success: Date.now() };
}
