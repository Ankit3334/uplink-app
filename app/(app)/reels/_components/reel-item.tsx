"use client";

import { useRef, useState } from "react";
import { Heart, Terminal } from "lucide-react";
import { toggleReelBoost } from "@/app/actions/posts";
import { ReelActions } from "./reel-actions";
import { ReelVideo } from "./reel-video";

export function ReelItem({
  reelId,
  videoUrl,
  username,
  avatarUrl,
  caption,
  audioLabel,
  boostCount,
  commentCount,
  initialBoosted,
  initialBookmarked,
}: {
  reelId: string;
  videoUrl: string;
  username: string;
  avatarUrl: string | null;
  caption: string | null;
  audioLabel: string;
  boostCount: number;
  commentCount: number;
  initialBoosted: boolean;
  initialBookmarked: boolean;
}) {
  const lastTap = useRef(0);
  const [showHeart, setShowHeart] = useState(false);

  const onDoubleTap = async () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      setShowHeart(true);
      window.setTimeout(() => setShowHeart(false), 1000);
      const res = await toggleReelBoost(reelId);
      if (!res.error) {
        window.dispatchEvent(
          new CustomEvent("reel:boosted", {
            detail: { reelId, boosted: res.boosted, boostCount: res.boostCount },
          }),
        );
      }
    } else {
      lastTap.current = now;
    }
  };

  return (
    <article
      id={reelId}
      className="relative flex h-[calc(100dvh-4rem)] w-full snap-start snap-always items-center justify-center bg-[#050505]"
    >
      <div className="absolute inset-0" onClick={onDoubleTap}>
        <ReelVideo src={videoUrl} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/10 via-transparent to-[#050505]/75" />

      {showHeart ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Heart
            size={80}
            className="text-white/90 animate-heart-pop"
            fill="currentColor"
            strokeWidth={0}
          />
        </div>
      ) : null}

      <ReelActions
        reelId={reelId}
        boostCount={boostCount}
        commentCount={commentCount}
        initialBoosted={initialBoosted}
        initialBookmarked={initialBookmarked}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pr-20 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center border border-zinc-700 bg-[#111111]/80 text-zinc-300">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={`${username} avatar`} className="h-full w-full object-cover" />
            ) : (
              <Terminal size={14} strokeWidth={1.8} />
            )}
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-zinc-100">
            @{username}
          </p>
        </div>

        {caption ? (
          <p className="mt-2 max-w-[85%] text-sm leading-relaxed text-zinc-200">{caption}</p>
        ) : null}

        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-400">
          Audio: {audioLabel}
        </p>
      </div>
    </article>
  );
}
