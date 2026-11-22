"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { triggerHaptic } from "@/src/lib/utils";

/** Floating create button that replaces the old center nav item. */
export function FeedFab() {
  return (
    <Link
      href="/upload"
      onClick={triggerHaptic}
      aria-label="Create new transmission"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 transition-transform duration-200 active:scale-95"
    >
      <Plus size={26} strokeWidth={2.25} />
    </Link>
  );
}
