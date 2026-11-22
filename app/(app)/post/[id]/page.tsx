import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Terminal } from "lucide-react";
import { deletePost } from "@/app/actions/posts";
import { DeletePostButton } from "./_components/delete-post-button";
import { PostActions } from "@/app/(app)/_components/post-actions";
import { PostImage } from "@/app/(app)/_components/post-image";
import { FadeIn } from "@/src/components/fade-in";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ThreadComposer } from "./_components/thread-composer";
import { parseRichText } from "@/src/lib/utils";

type ProfileRef = {
  username: string | null;
  avatar_url: string | null;
} | null;

type PostDetail = {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  body: string | null;
  boost_count: number;
  thread_count: number;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean | null;
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
  const user = await requireUser();
  const supabase = await createClient();

  const { data: postData } = await supabase
    .from("posts")
    .select(
      "id, user_id, image_url, caption, body, boost_count, thread_count, created_at, updated_at, is_edited, profiles(username, avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!postData) notFound();

  const post = postData as PostDetail;
  const postProfile = pickProfile(post.profiles);
  const postUsername = postProfile?.username ?? "unknown_node";
  const postAvatar = postProfile?.avatar_url ?? null;
  const isOwner = user.id === post.user_id;

  const [{ data: threadData }, { data: boostRow }, { data: bookmarkRow }] = await Promise.all([
    supabase
      .from("threads")
      .select("id, user_id, post_id, content, created_at, profiles(username, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("boosts").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("bookmarks").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle(),
  ]);

  const threads = (threadData ?? []) as ThreadRow[];
  const shareUrl = `/post/${post.id}`;

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col px-4 pt-6 pb-28 animate-fade-in-up">
      <div className="mb-3 flex items-center gap-3 border-b border-zinc-800 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <p className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
          Thread // {id.slice(0, 8)}
        </p>
      </div>

      <FadeIn>
        <article className="border-b border-zinc-800 bg-[#050505]">
          <header className="flex items-center gap-3 py-3">
            <div className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-[#0a0a0a] text-zinc-400">
              {postAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={postAvatar}
                  alt={`${postUsername} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={14} strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {postProfile?.username ? (
                <Link
                  href={`/u/${postProfile.username}`}
                  className="block truncate text-sm font-semibold text-zinc-100 transition-colors hover:text-[#22d3ee]"
                >
                  {postUsername}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold text-zinc-100">{postUsername}</p>
              )}
            </div>
            <p className="font-mono text-xs text-zinc-500">
              {formatTimestamp(post.created_at)}
              {post.is_edited ? <span className="ml-1 normal-case tracking-normal text-zinc-600">(edited)</span> : null}
            </p>
          </header>

          {post.image_url ? (
            <PostImage
              postId={post.id}
              src={post.image_url}
              alt={post.caption ? post.caption : `Transmission by ${postUsername}`}
            />
          ) : null}

          <PostActions
            postId={post.id}
            initialBoosted={Boolean(boostRow)}
            initialBoostCount={post.boost_count ?? 0}
            threadCount={post.thread_count ?? threads.length}
            initialBookmarked={Boolean(bookmarkRow)}
            shareUrl={shareUrl}
            compact
            isOwner={isOwner}
            initialBody={post.body ?? ""}
            canEdit
          />

          <div className="px-3 pb-3">
            <p className="text-sm font-semibold text-zinc-100">
              {post.boost_count ?? 0} {(post.boost_count ?? 0) === 1 ? "boost" : "boosts"}
            </p>

            {post.body ? (
              <div className="mt-2 text-base leading-relaxed text-zinc-100 whitespace-pre-wrap break-words">
                {!post.image_url ? (
                  <span className="mr-2 font-semibold text-zinc-100">{postUsername}</span>
                ) : null}
                {parseRichText(post.body)}
              </div>
            ) : null}

            {post.caption ? (
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                <span className="mr-2 font-semibold text-zinc-100">{postUsername}</span>
                {parseRichText(post.caption)}
              </p>
            ) : null}
            {isOwner ? (
              <form action={deletePost} className="mt-2">
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="redirectTo" value="/profile" />
                <DeletePostButton />
              </form>
            ) : null}
          </div>
        </article>
      </FadeIn>

      <div className="pt-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            Threads
          </h2>
          <span className="font-mono text-[11px] text-zinc-500">{threads.length}</span>
        </div>

        {threads.length === 0 ? (
          <div className="px-1 py-6 text-center">
            <p className="text-sm text-zinc-400">No threads yet.</p>
            <p className="mt-1 text-xs text-zinc-500">Be the first to start the conversation.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {threads.map((thread, index) => {
              const tProfile = pickProfile(thread.profiles);
              const tUsername = tProfile?.username ?? "unknown_node";
              const tAvatar = tProfile?.avatar_url ?? null;
              return (
                <FadeIn key={thread.id} delay={index * 0.02}>
                  <li className="flex items-start gap-3 border-b border-zinc-800 px-1 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#0a0a0a] text-zinc-500">
                      {tAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tAvatar}
                          alt={`${tUsername} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={13} strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-zinc-300">
                        {tProfile?.username ? (
                          <Link
                            href={`/u/${tProfile.username}`}
                            className="mr-2 font-semibold text-zinc-100 transition-colors hover:text-[#22d3ee]"
                          >
                            {tUsername}
                          </Link>
                        ) : (
                          <span className="mr-2 font-semibold text-zinc-100">{tUsername}</span>
                        )}
                        <span>{parseRichText(thread.content)}</span>
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        {formatTimestamp(thread.created_at)}
                      </p>
                    </div>
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
