"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ToggleFollowResult = {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  error?: string;
};

export async function toggleFollow(
  followingId: string,
): Promise<ToggleFollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
      error: "Authentication required.",
    };
  }

  if (!followingId || followingId === user.id) {
    return {
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
      error: "Invalid target.",
    };
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
    if (!error) {
      isFollowing = false;
    } else {
      isFollowing = true;
    }
  } else {
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: followingId,
    });
    if (!error) {
      isFollowing = true;
    } else {
      isFollowing = false;
    }
  }

  const [{ count: followersCount }, { count: followingCount }, { data: target }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", followingId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", followingId),
      supabase
        .from("profiles")
        .select("username")
        .eq("id", followingId)
        .maybeSingle(),
    ]);

  revalidatePath("/");
  revalidatePath("/profile");
  if (target?.username) {
    revalidatePath(`/u/${target.username}`);
  }

  return {
    isFollowing,
    followersCount: followersCount ?? 0,
    followingCount: followingCount ?? 0,
  };
}
