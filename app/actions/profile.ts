"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type OnboardingState = {
  error?: string;
};

export type UpdateProfileState = {
  error?: string;
  success?: number;
};

export type UpdateAvatarState = {
  error?: string;
  success?: number;
  avatarUrl?: string;
};

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const rawUsername = String(formData.get("username") ?? "").trim();
  const username = rawUsername.toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!username || !displayName) {
    return { error: "CONFIG ERROR: Username and display name are required." };
  }

  if (!/^[a-z0-9]+$/.test(username)) {
    return {
      error: "CONFIG ERROR: Username must be alphanumeric (a-z, 0-9).",
    };
  }

  if (username.length < 3 || username.length > 32) {
    return {
      error: "CONFIG ERROR: Username must be between 3 and 32 characters.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/");
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name: displayName,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "CONFIG ERROR: Username already claimed." };
    }
    return { error: `CONFIG ERROR: ${error.message}` };
  }

  redirect("/");
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bioRaw = formData.get("bio");
  const bio = typeof bioRaw === "string" ? bioRaw.trim() : "";

  if (!displayName) {
    return { error: "CONFIG ERROR: Display name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: `CONFIG ERROR: ${error.message}` };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: Date.now() };
}

export async function updateAvatar(
  _prevState: UpdateAvatarState,
  formData: FormData,
): Promise<UpdateAvatarState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "UPLOAD FAILED: No image payload detected." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "UPLOAD FAILED: Payload must be an image file." };
  }

  const filename = `${user.id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filename, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { error: `UPLOAD FAILED: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filename);

  const versionedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: versionedUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: `UPLOAD FAILED: ${updateError.message}` };
  }

  revalidatePath("/profile");
  revalidatePath("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return { success: Date.now(), avatarUrl: versionedUrl };
}
