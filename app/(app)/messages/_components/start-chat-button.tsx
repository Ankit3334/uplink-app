"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { getOrCreateRoom } from "@/app/actions/messages";
import { triggerHaptic } from "@/src/lib/utils";

const fullButton =
  "inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full border border-zinc-700 bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-70";

const compactButton =
  "inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-cyan-400/40 hover:bg-zinc-900 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60";

/** Opens (or lazily creates) the DM room, then navigates straight into it. */
export function StartChatButton({
  targetUserId,
  compact = false,
}: {
  targetUserId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const openChat = () => {
    triggerHaptic();
    setError(null);
    startTransition(async () => {
      const result = await getOrCreateRoom(targetUserId);
      if (result.error || !result.roomId) {
        setError(result.error ?? "Unable to open channel.");
        return;
      }
      router.push(`/messages/${result.roomId}`);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={openChat}
        disabled={pending}
        aria-label={compact ? "Start chat" : "Message"}
        className={compact ? compactButton : fullButton}
      >
        {pending ? (
          <Loader2 size={compact ? 12 : 14} className="animate-spin" />
        ) : (
          <MessageSquare size={compact ? 12 : 15} strokeWidth={2} />
        )}
        {compact ? "Start Chat" : "Message"}
      </button>
      {error ? (
        <p className="max-w-[160px] text-right text-[10px] leading-tight text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
