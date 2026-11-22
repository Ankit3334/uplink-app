import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Terminal } from "lucide-react";
import { deletePost } from "@/app/actions/posts";
import { DeletePostButton } from "./_components/delete-post-button";
import { PostActions } from "@/app/(app)/_components/post-actions";
import { PostImage } from "@/app/(app)/_components/post-image";
import { CodeBlock } from "@/src/components/code-block";
import { FadeIn } from "@/src/components/fade-in";
import { TechStackBadges } from "@/src/components/tech-stack-badges";
import {
  POST_CATEGORY_BADGE_CLASS,
  categoryLabel,
} from "@/src/lib/post-categories";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ThreadComposer } from "./_components/thread-composer";
import { parseRichText } from "@/src/lib/utils";

type ProfileRef = {
  username: string | null;
  avatar_url: string | null;
  tech_stack: string[] | null;
  currently_building: string | null;
  open_to_work: boolean | null;
} | null;

type PostDetail = {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  body: string | null;
  category: string | null;
  boost_count: number;
  thread_count: number;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean | null;
  is_code_block: boolean | null;
  language: string | null;
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
      "id, user_id, image_url, caption, body, category, boost_count, thread_count, created_at, updated_at, is_edited, is_code_block, language, profiles(username, avatar_url, tech_stack, currently_building, open_to_work)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!postData) notFound();

  const post = postData as PostDetail;
  const postProfile = pickProfile(post.profiles);
  const postUsername = postProfile?.username ?? "unknown_node";
  const postAvatar = postProfile?.avatar_url ?? null;
  const techStack = Array.isArray(postProfile?.tech_stack)
    ? postProfile.tech_stack
    : [];
  const building = postProfile?.currently_building ?? "";
  const openToWork = Boolean(postProfile?.open_to_work);
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
        <p className="ml-auto text-xs text-zinc-500">
          Thread // {id.slice(0, 8)}
        </p>
      </div>

      <FadeIn>
        <article className="flex flex-col gap-4 border-b border-zinc-800 bg-[#050505] py-4">
          <header className="flex items-center gap-3 px-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              {postAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={postAvatar}
                  alt={`${postUsername} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={15} strokeWidth={1.8} />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {postProfile?.username ? (
                <Link
                  href={`/u/${postProfile.username}`}
                  className="truncate text-[15px] font-semibold text-zinc-100 transition-colors hover:text-cyan-400"
                >
                  {postUsername}
                </Link>
              ) : (
                <p className="truncate text-[15px] font-semibold text-zinc-100">{postUsername}</p>
              )}
              {openToWork ? (
                <span className="inline-flex flex-shrink-0 items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                  Open to Work
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-500">
              {formatTimestamp(post.created_at)}
              {post.is_edited ? <span className="ml-1 text-zinc-600">(edited)</span> : null}
            </p>
          </header>

          {building || techStack.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 px-4">
              {building ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-400" />
                  <span className="truncate">Building · {building}</span>
                </span>
              ) : null}
              <TechStackBadges stack={techStack} compact />
            </div>
          ) : null}

          {post.category ? (
            <div className="px-4">
              <span className={POST_CATEGORY_BADGE_CLASS}>
                {categoryLabel(post.category)}
              </span>
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            {post.image_url ? (
              <PostImage
                postId={post.id}
                src={post.image_url}
                alt={post.caption ? post.caption : `Transmission by ${postUsername}`}
              />
            ) : null}

            <div className="flex flex-col gap-2 px-4">
              <p className="text-xs font-medium text-zinc-500">
                {post.boost_count ?? 0} {(post.boost_count ?? 0) === 1 ? "boost" : "boosts"}
              </p>

              {post.body ? (
                post.is_code_block ? (
                  <div className="flex flex-col gap-2">
                    {!post.image_url ? (
                      <p className="text-[15px] font-semibold text-white">
                        {postUsername}
                      </p>
                    ) : null}
                    <CodeBlock code={post.body} language={post.language} />
                  </div>
                ) : (
                  <div className="text-[15px] leading-relaxed text-zinc-100 whitespace-pre-wrap break-words">
                    {!post.image_url ? (
                      <span className="mr-2 font-semibold text-white">{postUsername}</span>
                    ) : null}
                    {parseRichText(post.body)}
                  </div>
                )
              ) : null}

              {post.caption ? (
                <p className="text-[15px] leading-relaxed text-zinc-300">
                  <span className="mr-2 font-semibold text-white">{postUsername}</span>
                  {parseRichText(post.caption)}
                </p>
              ) : null}

              {isOwner ? (
                <form action={deletePost} className="pt-2">
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="redirectTo" value="/profile" />
                  <DeletePostButton />
                </form>
              ) : null}
            </div>
          </div>

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
        </article>
      </FadeIn>

      <div className="pt-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-zinc-500">
            Threads
          </h2>
          <span className="text-xs text-zinc-500">{threads.length}</span>
        </div>

        {threads.length === 0 ? (
          <div className="px-1 py-6 text-center">
            <p className="text-[15px] text-zinc-400">No threads yet.</p>
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
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
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
                      <p className="text-[15px] leading-relaxed text-zinc-300">
                        {tProfile?.username ? (
                          <Link
                            href={`/u/${tProfile.username}`}
                            className="mr-2 font-semibold text-zinc-100 transition-colors hover:text-cyan-400"
                          >
                            {tUsername}
                          </Link>
                        ) : (
                          <span className="mr-2 font-semibold text-zinc-100">{tUsername}</span>
                        )}
                        <span>{parseRichText(thread.content)}</span>
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
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
