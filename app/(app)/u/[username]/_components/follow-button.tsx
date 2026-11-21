"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toggleFollow } from "@/app/actions/social";

export function FollowButton({
  followingId,
  initialIsFollowing,
  isSelf,
}: {
  followingId: string;
  initialIsFollowing: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleFollow(followingId);
          if (!result.error) {
            setIsFollowing(result.isFollowing);
            router.refresh();
          }
        });
      }}
      className={
        isFollowing
          ? "flex min-w-[140px] items-center justify-center gap-2 border border-zinc-700 bg-[#111111] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          : "flex min-w-[140px] items-center justify-center gap-2 border border-[#22d3ee] bg-[#22d3ee] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#050505] transition-colors hover:bg-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>{isFollowing ? "Unfollowing" : "Following"}</span>
        </>
      ) : isFollowing ? (
        "UNFOLLOW"
      ) : (
        "FOLLOW"
      )}
    </button>
  );
}
