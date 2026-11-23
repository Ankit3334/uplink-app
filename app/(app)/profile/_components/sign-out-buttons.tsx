"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";

export function SignOutIconButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-label="Sever connection"
      title="Sever connection"
      disabled={pending}
      className="flex h-10 w-10 items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={18} strokeWidth={1.8} className="animate-spin" />
      ) : (
        <LogOut size={18} strokeWidth={1.8} />
      )}
    </button>
  );
}

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Severing...</span>
        </>
      ) : (
        "SEVER CONNECTION"
      )}
    </button>
  );
}
