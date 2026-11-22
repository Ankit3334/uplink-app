"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addThread, type AddThreadState } from "@/app/actions/posts";
import { triggerHaptic } from "@/src/lib/utils";
import { useKeyboardInset } from "@/src/lib/use-keyboard-inset";

const initialState: AddThreadState = {};

function PostButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="px-2 py-1 text-sm font-semibold text-[#22d3ee] transition-all duration-200 ease-out hover:text-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Posting" : "Post"}
    </button>
  );
}

export function ThreadComposer({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(addThread, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const keyboardInset = useKeyboardInset();

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    if (keyboardInset > 0) {
      inputRef.current?.scrollIntoView({ block: "end" });
    }
  }, [keyboardInset]);

  return (
    <div className="composer-bottom fixed inset-x-0 z-40 border-t border-zinc-800 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-4 py-2">
        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="postId" value={postId} />
          <input
            ref={inputRef}
            name="content"
            type="text"
            required
            autoComplete="off"
            enterKeyHint="send"
            placeholder="Add a thread..."
            className="h-10 flex-1 bg-transparent text-sm text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500"
          />
          <PostButton />
        </form>
        {state?.error ? (
          <p className="pb-1 font-mono text-[11px] text-red-400">{state.error}</p>
        ) : null}
      </div>
    </div>
  );
}
