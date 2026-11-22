import Link from "next/link";
import { MessageSquare, Terminal } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type RoomRow = {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string | null;
};

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

function formatTimestamp(iso: string | null) {
  if (!iso) return "NO SIGNAL";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function MessagesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: roomsData } = await supabase
    .from("message_rooms")
    .select("id, user_1_id, user_2_id, last_message_at")
    .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const rooms = (roomsData ?? []) as RoomRow[];
  const otherUserIds = Array.from(
    new Set(rooms.map((r) => (r.user_1_id === user.id ? r.user_2_id : r.user_1_id))),
  );

  let profilesById = new Map<string, ProfileRow>();
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", otherUserIds);
    profilesById = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
  }

  const roomIds = rooms.map((r) => r.id);
  const lastMessageByRoom = new Map<string, string>();
  if (roomIds.length > 0) {
    const { data: messages } = await supabase
      .from("messages")
      .select("room_id, content, created_at")
      .in("room_id", roomIds)
      .order("created_at", { ascending: false });
    for (const m of messages ?? []) {
      const roomId = m.room_id as string;
      if (!lastMessageByRoom.has(roomId)) {
        lastMessageByRoom.set(roomId, (m.content as string | null) ?? "");
      }
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // Direct
        </p>
        <h1 className="mt-2 text-xl font-bold uppercase tracking-wider text-zinc-100">
          Messages
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Private encrypted channel index. Select a node to open transmission.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        {rooms.length === 0 ? (
          <div className="border border-zinc-800 bg-[#0a0a0a] p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">
              {"// NO TRANSMISSIONS FOUND"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              No direct message channels detected.
            </p>
          </div>
        ) : (
          <div className="flex flex-col border border-zinc-800 bg-[#0a0a0a]">
            {rooms.map((room, idx) => {
              const otherId = room.user_1_id === user.id ? room.user_2_id : room.user_1_id;
              const profile = profilesById.get(otherId);
              const username = profile?.username ?? "unknown_node";
              const displayName = profile?.display_name ?? username;
              const avatarUrl = profile?.avatar_url ?? null;
              const preview = lastMessageByRoom.get(room.id) || "No transmissions yet.";

              return (
                <Link
                  key={room.id}
                  href={`/messages/${room.id}`}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-[#111111] ${idx > 0 ? "border-t border-zinc-800" : ""}`}
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={`${username} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Terminal size={18} strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100">
                        @{username}
                      </p>
                      <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                        {formatTimestamp(room.last_message_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                      {displayName}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-400">{preview}</p>
                  </div>
                  <MessageSquare size={16} className="flex-shrink-0 text-zinc-600" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
