"use client";

import { useFormStatus } from "react-dom";
import { Zap, Loader2 } from "lucide-react";
import { toggleBoost } from "@/app/actions/posts";
import { triggerHaptic } from "@/src/lib/utils";

function BoostSubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="group flex items-center gap-2 border border-zinc-800 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 focus-visible:border-[#22d3ee] focus-visible:text-[#22d3ee] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin text-[#22d3ee]" />
      ) : (
        <Zap
          size={15}
          className="transition-colors duration-200 ease-in-out group-hover:text-zinc-200 group-focus-visible:text-[#22d3ee]"
        />
      )}
      <span>{pending ? "Boosting" : "Boost"}</span>
      <span className="font-mono text-zinc-500 group-hover:text-zinc-300 group-focus-visible:text-[#22d3ee]">
        [{count}]
      </span>
    </button>
  );
}

export function BoostForm({
  postId,
  count,
}: {
  postId: string;
  count: number;
}) {
  return (
    <form action={toggleBoost}>
      <input type="hidden" name="postId" value={postId} />
      <BoostSubmitButton count={count} />
    </form>
  );
}
