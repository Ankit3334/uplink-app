"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark, Heart, MessageCircle, Send, X, Link2 } from "lucide-react";
import { toggleReelBookmark, toggleReelBoost } from "@/app/actions/posts";

function ShareSheet({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onClose();
    } catch {}
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url });
        onClose();
        return;
      }
    } catch {}
    await copy();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close share sheet"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md border border-zinc-800 border-b-0 bg-[#0a0a0a] px-4 pb-6 pt-3 animate-fade-in">
        <div className="mx-auto mb-4 h-1 w-10 bg-zinc-700" />
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">Share Reel</p>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-3 border-b border-zinc-800 py-3 text-left text-sm text-zinc-200 hover:text-[#22d3ee]"
          >
            <Link2 size={18} /> Copy link
          </button>
          <button
            type="button"
            onClick={shareX}
            className="flex items-center gap-3 border-b border-zinc-800 py-3 text-left text-sm text-zinc-200 hover:text-[#22d3ee]"
          >
            <Send size={18} /> Share to X
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center gap-3 border-b border-zinc-800 py-3 text-left text-sm text-zinc-200 hover:text-[#22d3ee]"
          >
            <MessageCircle size={18} /> Share via WhatsApp
          </button>
          <button
            type="button"
            onClick={nativeShare}
            className="flex items-center gap-3 py-3 text-left text-sm text-zinc-200 hover:text-[#22d3ee]"
          >
            <Send size={18} /> More options
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReelActions({
  reelId,
  boostCount,
  commentCount,
  initialBoosted = false,
  initialBookmarked = false,
}: {
  reelId: string;
  boostCount: number;
  commentCount: number;
  initialBoosted?: boolean;
  initialBookmarked?: boolean;
}) {
  const [boosted, setBoosted] = useState(initialBoosted);
  const [count, setCount] = useState(boostCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [shareOpen, setShareOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Allow double-tap component to sync state via custom event
  useEffect(() => {
    function onBoosted(e: Event) {
      const detail = (e as CustomEvent<{ reelId: string; boosted: boolean; boostCount: number }>).detail;
      if (detail?.reelId !== reelId) return;
      setBoosted(detail.boosted);
      setCount(detail.boostCount);
    }
    window.addEventListener("reel:boosted", onBoosted as EventListener);
    return () => window.removeEventListener("reel:boosted", onBoosted as EventListener);
  }, [reelId]);

  const onBoost = () => {
    const next = !boosted;
    setBoosted(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      const res = await toggleReelBoost(reelId);
      if (res.error) {
        setBoosted(!next);
        setCount((c) => c + (next ? -1 : 1));
      } else {
        setBoosted(res.boosted);
        setCount(res.boostCount);
      }
    });
  };

  const onBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      const res = await toggleReelBookmark(reelId);
      if (res.error) setBookmarked(!next);
      else setBookmarked(res.bookmarked);
    });
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/reels#${reelId}` : `/reels#${reelId}`;

  return (
    <>
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={onBoost}
          disabled={isPending}
          aria-label="Boost"
          className="flex flex-col items-center gap-1 text-zinc-100"
        >
          <Heart size={28} strokeWidth={1.8} className={boosted ? "text-[#22d3ee]" : "text-white"} fill={boosted ? "currentColor" : "none"} />
          <span className="font-mono text-[11px] text-zinc-200">{count}</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-zinc-100">
          <MessageCircle size={28} strokeWidth={1.8} className="text-white" />
          <span className="font-mono text-[11px] text-zinc-200">{commentCount}</span>
        </div>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="Share"
          className="flex flex-col items-center gap-1 text-white"
        >
          <Send size={28} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onBookmark}
          disabled={isPending}
          aria-label="Bookmark"
          className="flex flex-col items-center gap-1 text-white"
        >
          <Bookmark size={28} strokeWidth={1.8} className={bookmarked ? "text-[#22d3ee]" : "text-white"} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {shareOpen ? <ShareSheet url={shareUrl} onClose={() => setShareOpen(false)} /> : null}
    </>
  );
}
