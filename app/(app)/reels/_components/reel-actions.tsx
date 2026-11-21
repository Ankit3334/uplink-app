"use client";

import { useState } from "react";
import { Heart, MessageSquare, Share2 } from "lucide-react";

export function ReelActions({
  reelId,
  boostCount,
  commentCount,
}: {
  reelId: string;
  boostCount: number;
  commentCount: number;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = `${window.location.origin}/reels#${reelId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }

  return (
    <div className="absolute right-2 bottom-24 z-10 flex flex-col items-center gap-3 sm:right-3">
      <button
        type="button"
        className="flex min-w-[52px] flex-col items-center gap-1 border border-zinc-800 bg-[#0a0a0a]/80 px-2 py-2 text-zinc-300 transition-colors hover:border-[#22d3ee] hover:text-[#22d3ee]"
        aria-label="Boost reel"
      >
        <Heart size={18} strokeWidth={1.8} />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
          BOOST
        </span>
        <span className="font-mono text-[10px] text-zinc-400">
          [{boostCount ?? 0}]
        </span>
      </button>

      <button
        type="button"
        className="flex min-w-[52px] flex-col items-center gap-1 border border-zinc-800 bg-[#0a0a0a]/80 px-2 py-2 text-zinc-300 transition-colors hover:border-[#22d3ee] hover:text-[#22d3ee]"
        aria-label="Thread"
      >
        <MessageSquare size={18} strokeWidth={1.8} />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
          THREAD
        </span>
        <span className="font-mono text-[10px] text-zinc-400">
          [{commentCount ?? 0}]
        </span>
      </button>

      <button
        type="button"
        onClick={onShare}
        className="flex min-w-[52px] flex-col items-center gap-1 border border-zinc-800 bg-[#0a0a0a]/80 px-2 py-2 text-zinc-300 transition-colors hover:border-[#22d3ee] hover:text-[#22d3ee]"
        aria-label="Share reel"
      >
        <Share2 size={18} strokeWidth={1.8} />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
          {copied ? "COPIED" : "SHARE"}
        </span>
      </button>
    </div>
  );
}
