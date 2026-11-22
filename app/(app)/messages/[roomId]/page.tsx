import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Terminal } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ChatRoom } from "./_components/chat-room";

type MessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  created_at: string;
};

export default async function MessageRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("message_rooms")
    .select("id, user_1_id, user_2_id")
    .eq("id", roomId)
    .maybeSingle();

  if (!room) {
    notFound();
  }

  const isParticipant = room.user_1_id === user.id || room.user_2_id === user.id;
  if (!isParticipant) {
    notFound();
  }

  const otherUserId = room.user_1_id === user.id ? room.user_2_id : room.user_1_id;

  const [{ data: otherProfile }, { data: messagesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .eq("id", otherUserId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, room_id, sender_id, content, media_url, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100),
  ]);

  const messages = (messagesData ?? []) as MessageRow[];
  const username = otherProfile?.username ?? "unknown_node";
  const displayName = otherProfile?.display_name ?? username;
  const avatarUrl = otherProfile?.avatar_url ?? null;

  return (
    <section className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-md flex-col px-4 pt-4 animate-fade-in-up">
      <header className="mb-3 border border-zinc-800 bg-[#0a0a0a] p-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 border border-zinc-800 bg-[#111111] px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Terminal size={16} strokeWidth={1.8} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs font-semibold uppercase tracking-[0.12em] text-zinc-100">
              @{username}
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
              {displayName}
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            DM
          </span>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 border border-zinc-800 bg-[#0a0a0a]">
        <ChatRoom
          roomId={roomId}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </div>
    </section>
  );
}
