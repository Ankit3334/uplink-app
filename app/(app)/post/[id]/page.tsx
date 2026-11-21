import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Terminal } from "lucide-react";
import { BoostForm } from "@/app/(app)/_components/boost-form";
import { deletePost } from "@/app/actions/posts";
import { DeletePostButton } from "./_components/delete-post-button";
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
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-48 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 border border-zinc-800 bg-[#0a0a0a] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Thread Channel // {id.slice(0, 8)}
        </p>
      </div>

      <FadeIn>
        <article className="border border-zinc-800 bg-[#0a0a0a]">
          <header className="flex items-center gap-3 border-b border-zinc-800 p-4">
            <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
              {postAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={postAvatar}
                  alt={`${postUsername} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={18} strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {postProfile?.username ? (
                <Link
                  href={`/u/${postProfile.username}`}
                  className="block truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100 transition-colors hover:text-[#22d3ee]"
                >
                  @{postUsername}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100">
                  @{postUsername}
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                {formatTimestamp(post.created_at)}
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              PKT
            </span>
          </header>

          <div className="p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={
                post.caption
                  ? post.caption
                  : `Transmission by ${postUsername}`
              }
              className="w-full rounded-none border border-zinc-800 object-cover"
            />
          </div>

          {post.caption ? (
            <div className="px-4 pb-4">
              <p className="whitespace-pre-wrap border-l border-zinc-700 pl-4 font-mono text-sm leading-relaxed text-zinc-300">
                {post.caption}
              </p>
            </div>
          ) : null}

          <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-800 p-4">
            <BoostForm postId={post.id} count={post.boost_count ?? 0} />
            <div className="flex items-center gap-2 border border-zinc-800 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-zinc-400">
              <MessageSquare size={15} className="text-zinc-400" />
              <span>Thread</span>
              <span className="font-mono text-zinc-500">
                [{post.thread_count ?? threads.length}]
              </span>
            </div>
            {isOwner ? (
              <form action={deletePost} className="ml-auto">
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="redirectTo" value="/profile" />
                <DeletePostButton />
              </form>
            ) : null}
          </footer>
        </article>
      </FadeIn>

      <div className="mt-1">
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-100">
            Thread Log
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            {threads.length} entries
          </span>
        </div>

        {threads.length === 0 ? (
          <div className="border border-dashed border-zinc-800 bg-[#0a0a0a] p-5 text-sm text-zinc-400">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-300">
              No Thread Data
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-500">
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
                  <li className="border border-zinc-800 border-l-2 border-l-zinc-700 bg-[#0a0a0a] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      {tProfile?.username ? (
                        <Link
                          href={`/u/${tProfile.username}`}
                          className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:text-[#22d3ee]"
                        >
                          @{tUsername}
                        </Link>
                      ) : (
                        <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-200">
                          @{tUsername}
                        </p>
                      )}
                      <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                        {formatTimestamp(thread.created_at)}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-300">
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
