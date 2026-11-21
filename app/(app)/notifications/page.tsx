import Link from "next/link";
import { Heart, MessageSquare, Terminal, UserPlus } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "follow" | "thread" | "story_view" | "boost";
  post_id: string | null;
  created_at: string;
  is_read: boolean;
};

type ActorProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

function formatTimestamp(iso: string) {
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

function notificationText(
  type: NotificationRow["type"],
  actorUsername: string,
) {
  switch (type) {
    case "boost":
    case "like":
      return `@${actorUsername} boosted your transmission`;
    case "follow":
      return `@${actorUsername} started following you`;
    case "thread":
      return `@${actorUsername} initiated a thread on your transmission`;
    case "story_view":
      return `@${actorUsername} viewed your broadcast`;
    default:
      return `@${actorUsername} sent a signal`;
  }
}

function TypeIcon({ type }: { type: NotificationRow["type"] }) {
  if (type === "follow") return <UserPlus size={14} strokeWidth={1.8} />;
  if (type === "thread") return <MessageSquare size={14} strokeWidth={1.8} />;
  return <Heart size={14} strokeWidth={1.8} />;
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("id, user_id, actor_id, type, post_id, created_at, is_read")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (notificationsData ?? []) as NotificationRow[];

  const actorIds = Array.from(new Set(notifications.map((n) => n.actor_id)));
  let actorsById = new Map<string, ActorProfile>();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", actorIds);
    actorsById = new Map(((actors ?? []) as ActorProfile[]).map((a) => [a.id, a]));
  }

  if (notifications.some((n) => !n.is_read)) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // Alerts
        </p>
        <h1 className="mt-2 text-xl font-bold uppercase tracking-wider text-zinc-100">
          Notifications
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Incoming activity signals from the network.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        {notifications.length === 0 ? (
          <div className="animate-fade-in border border-zinc-800 bg-[#0a0a0a] p-5 text-sm text-zinc-400">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
              No Notifications
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Activity feed is clear. New boosts, follows, and threads will appear here.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col border border-zinc-800 bg-[#0a0a0a]">
            {notifications.map((n, idx) => {
              const actor = actorsById.get(n.actor_id);
              const actorUsername = actor?.username ?? "unknown_node";
              const avatarUrl = actor?.avatar_url ?? null;
              const href = actor?.username ? `/u/${actor.username}` : undefined;
              const text = notificationText(n.type, actorUsername);

              const content = (
                <>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={`${actorUsername} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Terminal size={16} strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-zinc-200">{text}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      {formatTimestamp(n.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2 text-zinc-500">
                    <TypeIcon type={n.type} />
                    {!n.is_read ? (
                      <span className="h-2 w-2 bg-[#22d3ee]" aria-label="Unread" />
                    ) : null}
                  </div>
                </>
              );

              const rowClass = `flex items-center gap-3 p-4 ${idx > 0 ? "border-t border-zinc-800" : ""} ${!n.is_read ? "bg-[#0f0f0f]" : ""}`;

              if (href) {
                return (
                  <Link
                    key={n.id}
                    href={href}
                    className={`${rowClass} transition-colors hover:bg-[#111111]`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={n.id} className={rowClass}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
