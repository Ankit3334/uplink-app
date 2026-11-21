"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { addThread, type AddThreadState } from "@/app/actions/posts";

const initialState: AddThreadState = {};

function TransmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 border border-zinc-700 bg-[#111111] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#22d3ee] transition-colors hover:border-zinc-600 hover:bg-[#161616] focus-visible:border-[#22d3ee] focus-visible:outline-none active:border-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span className="text-zinc-200">Transmitting</span>
        </>
      ) : (
        "TRANSMIT"
      )}
    </button>
  );
}

export function ThreadComposer({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(addThread, initialState);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-800 bg-[#050505]">
      <div className="mx-auto w-full max-w-md px-4 py-3">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <label className="block">
            <span className="sr-only">Inject data into thread</span>
            <textarea
              name="content"
              required
              rows={2}
              placeholder="INJECT DATA INTO THREAD..."
              className="w-full resize-none border border-zinc-800 bg-[#111111] px-3 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
            />
          </label>

          {state?.error ? (
            <div
              role="alert"
              className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300"
            >
              {state.error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Thread Injector // Live
            </p>
            <TransmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
