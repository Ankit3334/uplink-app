"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addThread, type AddThreadState } from "@/app/actions/posts";

const initialState: AddThreadState = {};

function PostButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-2 py-1 text-sm font-semibold text-[#22d3ee] transition-colors hover:text-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Posting" : "Post"}
    </button>
  );
}

export function ThreadComposer({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(addThread, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-800 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-4 py-2">
        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="postId" value={postId} />
          <input
            name="content"
            type="text"
            required
            autoComplete="off"
            placeholder="Add a thread..."
            className="h-10 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
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
