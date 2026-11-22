"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

export function DeletePostButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-label="Delete transmission"
      title="Delete transmission"
      disabled={pending}
      className="flex h-9 w-9 items-center justify-center border border-zinc-700 bg-transparent text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={16} strokeWidth={1.8} className="animate-spin" />
      ) : (
        <Trash2 size={16} strokeWidth={1.8} />
      )}
    </button>
  );
}
