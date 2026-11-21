import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Terminal, Trash2 } from "lucide-react";
import { BoostForm } from "@/app/(app)/_components/boost-form";
import { deletePost } from "@/app/actions/posts";
import { FadeIn } from "@/src/components/fade-in";
import { createClient } from "@/src/lib/supabase/server";
import { ThreadComposer } from "./_components/thread-composer";

type ProfileRef = {
  username: string | null;
  avatar_url: string | null;
} | null;

type PostDetail = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  boost_count: number;
  thread_count: number;
  created_at: string;
  profiles: ProfileRef | ProfileRef[];
};

type ThreadRow = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles: ProfileRef | ProfileRef[];
};

function pickProfile(p: ProfileRef | ProfileRef[]) {
  return Array.isArray(p) ? (p[0] ?? null) : p;
}

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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: postData } = await supabase
    .from("posts")
    .select(
      "id, user_id, image_url, caption, boost_count, thread_count, created_at, profiles(username, avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!postData) {
    notFound();
  }

  const post = postData as PostDetail;
  const postProfile = pickProfile(post.profiles);
  const postUsername = postProfile?.username ?? "unknown_node";
  const postAvatar = postProfile?.avatar_url ?? null;
  const isOwner = currentUser?.id === post.user_id;

  const { data: threadData } = await supabase
    .from("threads")
    .select("id, user_id, post_id, content, created_at, profiles(username)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const threads = (threadData ?? []) as ThreadRow[];

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pb-44 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 border border-neon-cyan/30 bg-[#0a0a0a] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#00f3ff] transition-colors hover:bg-[#00f3ff]/10"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#666]">
          Thread Channel // {id.slice(0, 8)}
        </p>
      </div>

      <FadeIn>
        <article className="border border-neon-cyan/20 bg-[#0a0a0a]">
          <header className="flex items-center gap-3 border-b border-[#1a1a1a] p-3">
            <div className="flex h-9 w-9 items-center justify-center border border-neon-green/40 bg-[#050505] text-[#39ff14]">
              {postAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={postAvatar}
                  alt={`${postUsername} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {postProfile?.username ? (
                <Link
                  href={`/u/${postProfile.username}`}
                  className="block truncate text-sm font-bold uppercase tracking-[0.08em] text-[#39ff14] glow-green hover:underline"
                >
                  @{postUsername}
                </Link>
              ) : (
                <p className="truncate text-sm font-bold uppercase tracking-[0.08em] text-[#39ff14] glow-green">
                  @{postUsername}
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777]">
                {formatTimestamp(post.created_at)}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#444]">
              PKT
            </span>
          </header>

          <div className="p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={
                post.caption
                  ? post.caption
                  : `Transmission by ${postUsername}`
              }
              className="w-full rounded-none border border-cyan-500/30 object-cover"
            />
          </div>

          {post.caption ? (
            <div className="px-3 pb-3">
              <p className="whitespace-pre-wrap border-l-2 border-neon-cyan/30 pl-3 font-mono text-sm leading-relaxed text-[#d0d0d0]">
                {post.caption}
              </p>
            </div>
          ) : null}

          <footer className="flex items-center gap-2 border-t border-[#1a1a1a] p-3">
            <BoostForm postId={post.id} count={post.boost_count ?? 0} />
            <div className="flex items-center gap-2 border border-neon-magenta/30 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#a0a0a0]">
              <MessageSquare size={16} className="text-[#ff00ff]" />
              <span>Thread</span>
              <span className="text-[#ff00ff]">
                [{post.thread_count ?? threads.length}]
              </span>
            </div>
            {isOwner ? (
              <form action={deletePost} className="ml-auto">
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="redirectTo" value="/profile" />
                <button
                  type="submit"
                  aria-label="Delete transmission"
                  title="Delete transmission"
                  className="flex h-9 w-9 items-center justify-center border border-neon-magenta bg-transparent text-[#ff00ff] transition-colors hover:bg-[#ff00ff]/15 hover:shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            ) : null}
          </footer>
        </article>
      </FadeIn>

      <div className="mt-2">
        <div className="mb-3 flex items-center justify-between border-b border-[#1f1f1f] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff00ff] glow-magenta">
            Thread Log
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
            {threads.length} entries
          </span>
        </div>

        {threads.length === 0 ? (
          <div className="border border-dashed border-neon-magenta/30 bg-[#0a0a0a] p-4 text-xs text-[#777]">
            <p className="uppercase tracking-[0.15em] text-[#ff00ff]">
              No Thread Data
            </p>
            <p className="mt-2 font-mono">
              Channel silent. Inject the first data packet below.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {threads.map((thread, index) => {
              const tProfile = pickProfile(thread.profiles);
              const tUsername = tProfile?.username ?? "unknown_node";
              return (
                <FadeIn key={thread.id} delay={index * 0.04}>
                  <li className="border border-[#1a1a1a] border-l-2 border-l-magenta-500/50 bg-[#0a0a0a] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      {tProfile?.username ? (
                        <Link
                          href={`/u/${tProfile.username}`}
                          className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-[#39ff14] glow-green hover:underline"
                        >
                          @{tUsername}
                        </Link>
                      ) : (
                        <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-[#39ff14] glow-green">
                          @{tUsername}
                        </p>
                      )}
                      <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[#666]">
                        {formatTimestamp(thread.created_at)}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#d0d0d0]">
                      {thread.content}
                    </p>
                  </li>
                </FadeIn>
              );
            })}
          </ul>
        )}
      </div>

      <ThreadComposer postId={post.id} />
    </section>
  );
}
