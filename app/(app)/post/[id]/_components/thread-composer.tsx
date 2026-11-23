"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CornerDownRight, X } from "lucide-react";
import { addThread, type AddThreadState } from "@/app/actions/posts";
import { triggerHaptic } from "@/src/lib/utils";
import { useKeyboardInset } from "@/src/lib/use-keyboard-inset";
import { useReply } from "./reply-context";

const initialState: AddThreadState = {};

function PostButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="px-2 py-1 text-sm font-semibold text-cyan-400 transition-all duration-200 ease-out hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Posting" : "Post"}
    </button>
  );
}

export function ThreadComposer({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(addThread, initialState);
  const { replyTarget, clearReply } = useReply();
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const keyboardInset = useKeyboardInset();

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      clearReply();
    }
  }, [state, clearReply]);

  useEffect(() => {
    if (!replyTarget || !inputRef.current) return;
    inputRef.current.value = `@${replyTarget.username} `;
    inputRef.current.focus();
    inputRef.current.scrollIntoView({ block: "end" });
  }, [replyTarget]);

  useEffect(() => {
    if (keyboardInset > 0) {
      inputRef.current?.scrollIntoView({ block: "end" });
    }
  }, [keyboardInset]);

  const cancelReply = () => {
    clearReply();
    formRef.current?.reset();
    inputRef.current?.focus();
  };

  return (
    <div className="composer-bottom fixed inset-x-0 z-40 border-t border-zinc-800 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-4 py-2">
        {replyTarget ? (
          <div className="mb-1.5 flex items-center gap-2 border-l-2 border-cyan-400 pl-2 text-[11px] text-zinc-400">
            <CornerDownRight size={12} className="flex-shrink-0 text-cyan-400" />
            <span className="min-w-0 truncate">
              Replying to{" "}
              <span className="font-semibold text-cyan-400">
                @{replyTarget.username}
              </span>
            </span>
            <button
              type="button"
              onClick={cancelReply}
              aria-label="Cancel reply"
              className="ml-auto flex-shrink-0 text-zinc-600 transition-colors hover:text-zinc-200 focus-visible:text-zinc-200 focus-visible:outline-none"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}

        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="postId" value={postId} />
          <input
            type="hidden"
            name="parentId"
            value={replyTarget?.parentId ?? ""}
          />
          <input
            ref={inputRef}
            name="content"
            type="text"
            required
            autoComplete="off"
            enterKeyHint="send"
            placeholder={
              replyTarget ? `Reply to @${replyTarget.username}...` : "Add a thread..."
            }
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500"
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
