"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FEED_TABS,
  type FeedTabValue,
} from "@/src/lib/post-categories";
import { triggerHaptic } from "@/src/lib/utils";

/** Instant highlight + background transition; the server filters the query. */
export function FeedTabs({ active }: { active: FeedTabValue }) {
  const router = useRouter();
  const [selected, setSelected] = useState<FeedTabValue>(active);
  const [pending, startTransition] = useTransition();

  const select = (value: FeedTabValue) => {
    if (value === selected) return;
    triggerHaptic();
    setSelected(value);
    startTransition(() => {
      router.push(value === "all" ? "/" : `/?category=${value}`, {
        scroll: false,
      });
    });
  };

  return (
    <div
      aria-busy={pending}
      className="flex gap-2 overflow-x-auto border-b border-zinc-800 px-4 py-3"
    >
      {FEED_TABS.map((tab) => {
        const isActive = selected === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => select(tab.value)}
            aria-pressed={isActive}
            className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40 ${
              isActive
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
