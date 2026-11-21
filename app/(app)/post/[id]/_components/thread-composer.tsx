"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { addThread, type AddThreadState } from "@/app/actions/posts";

const initialState: AddThreadState = {};

export function ThreadComposer({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(addThread, initialState);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-neon-cyan/30 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-4 py-3">
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="postId" value={postId} />
          <label className="block">
            <span className="sr-only">Inject data into thread</span>
            <textarea
              name="content"
              required
              rows={2}
              placeholder="INJECT DATA INTO THREAD..."
              className="w-full resize-none border border-neon-cyan bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#e0e0e0] outline-none placeholder:text-[#555] focus:shadow-[0_0_8px_rgba(0,243,255,0.3)]"
            />
          </label>

          {state?.error ? (
            <div
              role="alert"
              className="border border-[#ff00ff]/50 bg-[#ff00ff]/5 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#ff4dff]"
            >
              {state.error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
              Thread Injector // Live
            </p>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 border-2 border-[#00f3ff] bg-[#00f3ff]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00f3ff] transition-colors hover:bg-[#00f3ff]/20 hover:shadow-[0_0_10px_rgba(0,243,255,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Transmitting</span>
                </>
              ) : (
                "Transmit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
