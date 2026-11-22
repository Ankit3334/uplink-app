"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptConnectionRequest,
  ignoreConnectionRequest,
} from "@/app/actions/social";
import { triggerHaptic } from "@/src/lib/utils";

export function ConnectionRequestActions({
  connectionId,
}: {
  connectionId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (accept: boolean) => {
    triggerHaptic();
    setError(null);
    startTransition(async () => {
      const result = accept
        ? await acceptConnectionRequest(connectionId)
        : await ignoreConnectionRequest(connectionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(true)}
        className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-60"
      >
        Accept
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(false)}
        className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-60"
      >
        Ignore
      </button>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}
