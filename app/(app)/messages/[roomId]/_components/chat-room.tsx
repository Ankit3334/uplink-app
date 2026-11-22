"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { sendMessage, type SendMessageState } from "@/app/actions/messages";
import { createClient } from "@/src/lib/supabase/client";
import { triggerHaptic } from "@/src/lib/utils";
import { useKeyboardInset } from "@/src/lib/use-keyboard-inset";

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  created_at: string;
};

const initialState: SendMessageState = {};

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="flex h-10 w-10 items-center justify-center border border-zinc-700 bg-[#111111] text-cyan-400 transition-colors hover:border-cyan-400 hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Send message"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
    </button>
  );
}

export function ChatRoom({
  roomId,
  currentUserId,
  initialMessages,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [state, formAction] = useActionState(sendMessage, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const keyboardInset = useKeyboardInset();

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [messages],
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [sortedMessages.length, keyboardInset]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={listRef}
        className="native-scroll flex-1 overflow-y-auto px-3 pt-3"
        style={{
          paddingBottom: `calc(7rem + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
        }}
      >
        {sortedMessages.length === 0 ? (
          <div className="border border-zinc-800 bg-[#111111] p-4 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
            No transmissions in this channel. Send the first signal.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedMessages.map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl border px-3 py-2 ${
                      mine
                        ? "border-cyan-400/40 bg-[#111111] text-zinc-100"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200"
                    }`}
                  >
                    {msg.content ? (
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                        {msg.content}
                      </p>
                    ) : null}
                    {msg.media_url ? (
                      <p className="mt-1 break-all font-mono text-[10px] text-zinc-400">
                        {msg.media_url}
                      </p>
                    ) : null}
                    <p
                      className={`mt-1 text-xs ${
                        mine ? "text-cyan-400/80" : "text-zinc-500"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="composer-bottom fixed inset-x-0 z-40 mx-auto w-full max-w-md px-4">
        <form
          ref={formRef}
          action={formAction}
          className="border border-zinc-800 bg-[#0a0a0a] p-2"
        >
          <input type="hidden" name="roomId" value={roomId} />
          <div className="flex items-center gap-2">
            <input
              name="content"
              type="text"
              autoComplete="off"
              enterKeyHint="send"
              placeholder="ENTER MESSAGE..."
              className="h-10 flex-1 border border-zinc-800 bg-[#111111] px-3 font-mono text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400"
            />
            <SendButton />
          </div>
          {state?.error ? (
            <p className="mt-2 border border-zinc-700 bg-[#111111] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300">
              {state.error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
