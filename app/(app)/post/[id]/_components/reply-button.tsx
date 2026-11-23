"use client";

import { CornerDownRight } from "lucide-react";
import { triggerHaptic } from "@/src/lib/utils";
import { useReply } from "./reply-context";

export function ReplyButton({
  parentId,
  username,
}: {
  parentId: string;
  username: string;
}) {
  const { beginReply } = useReply();

  const handleClick = () => {
    triggerHaptic();
    beginReply({ parentId, username });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Reply to ${username}`}
      className="ml-2 inline-flex items-center gap-1 align-middle text-zinc-600 transition-colors hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none"
    >
      <CornerDownRight size={14} strokeWidth={1.8} />
      <span className="text-[11px]">Reply</span>
    </button>
  );
}
