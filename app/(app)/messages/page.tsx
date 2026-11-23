import Link from "next/link";
import { MessageSquare, Terminal } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { StartChatButton } from "./_components/start-chat-button";

type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
};

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

  // The directory is driven by accepted connections, not existing rooms, so
  // every connection is reachable even before a channel has been created.
  const [{ data: connectionsData }, { data: roomsData }] = await Promise.all([
    supabase
      .from("connections")
      .select("id, requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
    supabase
      .from("message_rooms")
      .select("id, user_1_id, user_2_id, last_message_at")
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false }),
  ]);

  const connections = (connectionsData ?? []) as ConnectionRow[];
  const rooms = (roomsData ?? []) as RoomRow[];

  const roomByUserId = new Map<string, RoomRow>();
  for (const room of rooms) {
    const otherId = room.user_1_id === user.id ? room.user_2_id : room.user_1_id;
    if (!roomByUserId.has(otherId)) {
      roomByUserId.set(otherId, room);
    }
  }

  const otherUserIds = Array.from(
    new Set(
      connections.map((c) =>
        c.requester_id === user.id ? c.addressee_id : c.requester_id,
      ),
    ),
  );

  let profilesById = new Map<string, ProfileRow>();
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", otherUserIds);
    profilesById = new Map(
      ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]),
    );
  }

  const roomIds = Array.from(roomByUserId.values()).map((room) => room.id);
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

  const items = connections
    .map((connection) => {
      const otherId =
        connection.requester_id === user.id
          ? connection.addressee_id
          : connection.requester_id;
      return {
        otherId,
        profile: profilesById.get(otherId),
        room: roomByUserId.get(otherId) ?? null,
      };
    })
    .sort((a, b) => {
      // Active channels first, then connections awaiting a first message.
      const aTime = a.room?.last_message_at ?? "";
      const bTime = b.room?.last_message_at ?? "";
      return bTime.localeCompare(aTime);
    });

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-zinc-950 p-4">
        <p className="eyebrow">
          Channel // Direct
        </p>
        <h1 className="page-title">
          Messages
        </h1>
        <p className="page-subtitle">
          Private encrypted channel index. Select a node to open transmission.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        {items.length === 0 ? (
          <div className="u-panel u-empty">
            <p className="u-label">{"// NO CONNECTIONS FOUND"}</p>
            <p className="u-empty-copy">
              Connect with builders to open a direct channel.
            </p>
          </div>
        ) : (
          <div className="flex flex-col border border-zinc-800 bg-zinc-950">
            {items.map(({ otherId, profile, room }, idx) => {
              const username = profile?.username ?? "unknown_node";
              const displayName = profile?.display_name ?? username;
              const avatarUrl = profile?.avatar_url ?? null;
              const preview = room
                ? lastMessageByRoom.get(room.id) || "No transmissions yet."
                : "No channel yet — start one now.";
              const timestamp = room
                ? formatTimestamp(room.last_message_at)
                : "NEW CHANNEL";
              const rowClass = `flex items-center gap-3 p-4 transition-colors ${idx > 0 ? "border-t border-zinc-800" : ""}`;

              const avatar = (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400">
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
              );

              const info = (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100">
                      @{username}
                    </p>
                    <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      {timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-400">{preview}</p>
                </div>
              );

              return room ? (
                <Link
                  key={otherId}
                  href={`/messages/${room.id}`}
                  className={`${rowClass} hover:bg-zinc-900`}
                >
                  {avatar}
                  {info}
                  <MessageSquare size={16} className="flex-shrink-0 text-zinc-500" />
                </Link>
              ) : (
                <div key={otherId} className={rowClass}>
                  {avatar}
                  {info}
                  <StartChatButton targetUserId={otherId} compact />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
