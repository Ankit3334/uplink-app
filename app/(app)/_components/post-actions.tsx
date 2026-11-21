"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { toggleBookmark, toggleBoostPost } from "@/app/actions/posts";

export function PostActions({
  postId,
  initialBoosted,
  initialBoostCount,
  threadCount,
  initialBookmarked,
  shareUrl,
  compact = false,
}: {
  postId: string;
  initialBoosted: boolean;
  initialBoostCount: number;
  threadCount: number;
  initialBookmarked: boolean;
  shareUrl: string;
  compact?: boolean;
}) {
  const [boosted, setBoosted] = useState(initialBoosted);
  const [boostCount, setBoostCount] = useState(initialBoostCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onBoosted(e: Event) {
      const detail = (e as CustomEvent<{ postId: string; boosted: boolean; boostCount: number }>).detail;
      if (detail?.postId !== postId) return;
      setBoosted(detail.boosted);
      setBoostCount(detail.boostCount);
    }
    window.addEventListener("post:boosted", onBoosted as EventListener);
    return () => window.removeEventListener("post:boosted", onBoosted as EventListener);
  }, [postId]);

  const onBoost = () => {
    const next = !boosted;
    setBoosted(next);
    setBoostCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      const res = await toggleBoostPost(postId);
      if (!res.error) {
        setBoosted(res.boosted);
        setBoostCount(res.boostCount);
      } else {
        setBoosted(!next);
        setBoostCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  const onBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      const res = await toggleBookmark(postId);
      if (!res.error) {
        setBookmarked(res.bookmarked);
      } else {
        setBookmarked(!next);
      }
    });
  };

  const onShare = async () => {
    const absoluteUrl =
      typeof window !== "undefined"
        ? new URL(shareUrl, window.location.origin).toString()
        : shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({ url: absoluteUrl });
        return;
      }
    } catch {
      // fall through to copy
    }
    try {
      await navigator.clipboard.writeText(absoluteUrl);
    } catch {
      // no-op
    }
  };

  const iconClass = "transition-all duration-200 ease-out hover:text-zinc-100";

  return (
    <div className={`flex items-center justify-between ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBoost}
          aria-label={boosted ? "Remove boost" : "Boost"}
          disabled={isPending}
          className={`${iconClass} ${boosted ? "text-[#22d3ee]" : "text-zinc-300"}`}
        >
          <Heart size={24} strokeWidth={1.8} fill={boosted ? "currentColor" : "none"} />
        </button>
        <Link
          href={`/post/${postId}`}
          aria-label="Thread"
          className={`${iconClass} text-zinc-300`}
        >
          <MessageCircle size={24} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className={`${iconClass} text-zinc-300`}
        >
          <Send size={24} strokeWidth={1.8} />
        </button>
      </div>
      <button
        type="button"
        onClick={onBookmark}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        disabled={isPending}
        className={`${iconClass} ${bookmarked ? "text-[#22d3ee]" : "text-zinc-300"}`}
      >
        <Bookmark size={24} strokeWidth={1.8} fill={bookmarked ? "currentColor" : "none"} />
      </button>
      <span className="sr-only">{boostCount} boosts</span>
      <span className="sr-only">{threadCount} threads</span>
    </div>
  );
}

export function PostActionMeta({
  boostCount,
  username,
  caption,
  createdAt,
}: {
  boostCount: number;
  username: string;
  caption: string | null;
  createdAt: string;
}) {
  return (
    <div className="px-4 pb-3">
      <p className="font-mono text-xs text-zinc-300">
        {boostCount} {boostCount === 1 ? "boost" : "boosts"}
      </p>
      {caption ? (
        <p className="mt-1 text-sm leading-relaxed text-zinc-200">
          <span className="mr-2 font-semibold text-zinc-100">{username}</span>
          <span className="text-zinc-300">{caption}</span>
        </p>
      ) : null}
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
        {createdAt}
      </p>
    </div>
  );
}
