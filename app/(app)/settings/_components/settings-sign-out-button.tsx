"use client";

import { useFormStatus } from "react-dom";
import { ChevronRight, Loader2, LogOut } from "lucide-react";

export function SettingsSignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400">
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} strokeWidth={1.8} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-100">Log Out</span>
        <span className="mt-0.5 block text-xs text-zinc-400">
          Sign out of this node
        </span>
      </span>
      <ChevronRight size={15} className="flex-shrink-0 text-zinc-500" />
    </button>
  );
}
