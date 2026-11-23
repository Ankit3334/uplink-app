"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  acceptConnectionRequest,
  ignoreConnectionRequest,
  sendConnectionRequest,
  withdrawConnectionRequest,
  type ConnectionState,
} from "@/app/actions/social";
import { triggerHaptic } from "@/src/lib/utils";

const baseButton =
  "inline-flex min-w-[132px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70";

export function ConnectButton({
  addresseeId,
  initialStatus,
  initialConnectionId,
  isSelf,
}: {
  addresseeId: string;
  initialStatus: ConnectionState;
  initialConnectionId: string | null;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionState>(initialStatus);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return null;

  const run = (
    action: () => Promise<{
      status: ConnectionState;
      connectionId: string | null;
      error?: string;
    }>,
  ) => {
    triggerHaptic();
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus(result.status === "ignored" ? "none" : result.status);
      setConnectionId(result.connectionId);
      router.refresh();
    });
  };

  if (status === "accepted") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          className={`${baseButton} border border-cyan-400/20 bg-cyan-400/10 text-cyan-400`}
        >
          <Check size={15} strokeWidth={2.2} />
          Connected
        </button>
      </div>
    );
  }

  if (status === "pending_incoming" && connectionId) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => acceptConnectionRequest(connectionId))}
            className={`${baseButton} border border-zinc-100 bg-zinc-100 text-zinc-900 hover:bg-white`}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Accept
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => ignoreConnectionRequest(connectionId))}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Ignore
          </button>
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          className={`${baseButton} border border-zinc-600 bg-transparent text-zinc-300`}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null}
          Pending
        </button>
        {connectionId ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => withdrawConnectionRequest(connectionId))}
            className="text-xs text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-300 hover:underline"
          >
            Cancel request
          </button>
        ) : null}
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => sendConnectionRequest(addresseeId))}
        className={`${baseButton} border border-zinc-100 bg-zinc-100 text-zinc-900 hover:bg-white`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        Connect
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
