import Link from "next/link";
import { Check, Heart, MessageSquare, Terminal, UserPlus } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ConnectionRequestActions } from "./_components/connection-request-actions";

type NotificationType =
  | "like"
  | "follow"
  | "thread"
  | "story_view"
  | "boost"
  | "message"
  | "connection_request"
  | "connection_accepted";

type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
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

function notificationText(type: NotificationType, actorUsername: string) {
  switch (type) {
    case "boost":
    case "like":
      return `@${actorUsername} boosted your post`;
    case "follow":
      return `@${actorUsername} started following you`;
    case "connection_request":
      return `@${actorUsername} wants to connect with you`;
    case "connection_accepted":
      return `@${actorUsername} accepted your connection request`;
    case "thread":
      return `@${actorUsername} commented on your post`;
    case "message":
      return `@${actorUsername} sent you a message`;
    case "story_view":
      return `@${actorUsername} viewed your broadcast`;
    default:
      return `@${actorUsername} sent you an update`;
  }
}

function TypeIcon({ type }: { type: NotificationType }) {
  if (type === "follow" || type === "connection_request") {
    return <UserPlus size={14} strokeWidth={1.8} />;
  }
  if (type === "connection_accepted") {
    return <Check size={14} strokeWidth={1.8} />;
  }
  if (type === "thread") return <MessageSquare size={14} strokeWidth={1.8} />;
  if (type === "message") {
    return <MessageSquare size={14} strokeWidth={1.8} className="text-cyan-400" />;
  }
  return <Heart size={14} strokeWidth={1.8} />;
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: notificationsData }, { data: pendingConnections }] =
    await Promise.all([
      supabase
        .from("notifications")
        .select("id, user_id, actor_id, type, post_id, created_at, is_read")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("connections")
        .select("id, requester_id")
        .eq("addressee_id", user.id)
        .eq("status", "pending"),
    ]);

  const notifications = (notificationsData ?? []) as NotificationRow[];
  const pendingByActor = new Map(
    (pendingConnections ?? []).map((row) => [row.requester_id, row.id]),
  );

  const actorIds = Array.from(new Set(notifications.map((n) => n.actor_id)));
  let actorsById = new Map<string, ActorProfile>();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", actorIds);
    actorsById = new Map(
      ((actors ?? []) as ActorProfile[]).map((actor) => [actor.id, actor]),
    );
  }

  if (notifications.some((n) => !n.is_read)) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="u-panel p-5">
        <p className="eyebrow">Network</p>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          Connection requests and activity from your network.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        {notifications.length === 0 ? (
          <div className="u-empty u-panel py-10">
            <p className="u-empty-title">All caught up</p>
            <p className="u-empty-copy">New activity will appear here.</p>
          </div>
        ) : (
          <div className="flex animate-fade-in flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            {notifications.map((notification, index) => {
              const actor = actorsById.get(notification.actor_id);
              const actorUsername = actor?.username ?? "uplink_user";
              const avatarUrl = actor?.avatar_url ?? null;
              const href =
                notification.type === "message"
                  ? "/messages"
                  : actor?.username
                    ? `/u/${actor.username}`
                    : undefined;
              const connectionId = pendingByActor.get(notification.actor_id);

              const content = (
                <>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={`${actorUsername} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Terminal size={14} strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-relaxed text-zinc-200">
                      {notificationText(notification.type, actorUsername)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatTimestamp(notification.created_at)}
                    </p>
                    {notification.type === "connection_request" && connectionId ? (
                      <ConnectionRequestActions connectionId={connectionId} />
                    ) : null}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2 text-zinc-500">
                    <TypeIcon type={notification.type} />
                    {!notification.is_read ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
                        <span className="sr-only">Unread</span>
                      </>
                    ) : null}
                  </div>
                </>
              );

              const rowClass = `flex items-start gap-3 p-4 ${
                index > 0 ? "border-t border-zinc-800/70" : ""
              } ${!notification.is_read ? "bg-zinc-800/30" : ""}`;
              const hasActions =
                notification.type === "connection_request" && Boolean(connectionId);

              if (href && !hasActions) {
                return (
                  <Link
                    key={notification.id}
                    href={href}
                    className={`${rowClass} transition-colors hover:bg-zinc-800/50`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={notification.id} className={rowClass}>
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
