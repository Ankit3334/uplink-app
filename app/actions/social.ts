"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ToggleFollowResult = {
  isFollowing: boolean;
  followersCount: number;
  error?: string;
};

export async function toggleFollow(
  followingId: string,
): Promise<ToggleFollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isFollowing: false, followersCount: 0, error: "Authentication required." };
  }

  if (!followingId || followingId === user.id) {
    return { isFollowing: false, followersCount: 0, error: "Invalid target." };
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();

  let isFollowing = false;

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", existing.id)
      .eq("follower_id", user.id);
    isFollowing = Boolean(error);
  } else {
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: followingId,
    });
    isFollowing = !error;
  }

  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", followingId);

  revalidatePath("/");
  revalidatePath("/profile");

  return {
    isFollowing,
    followersCount: followersCount ?? 0,
  };
}
