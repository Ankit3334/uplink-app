import { Suspense } from "react";
import Link from "next/link";
import { Search, Terminal } from "lucide-react";
import {
  StoriesBar,
  type StoryItem,
  type StoryUserGroup,
} from "./_components/stories-bar";
import { PostActions } from "./_components/post-actions";
import { PostImage } from "./_components/post-image";
import { CodeBlock } from "@/src/components/code-block";
import { FadeIn } from "@/src/components/fade-in";
import { TechStackBadges } from "@/src/components/tech-stack-badges";
import { parseRichText } from "@/src/lib/utils";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type FeedProfile = {
  username: string | null;
  avatar_url: string | null;
  tech_stack: string[] | null;
  currently_building: string | null;
  open_to_work: boolean | null;
} | null;

type FeedPost = {
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
  profiles: FeedProfile | FeedProfile[];
};

const FEED_POST_SELECT =
  "id, user_id, image_url, caption, body, category, boost_count, thread_count, created_at, updated_at, is_edited, is_code_block, language, profiles(username, avatar_url, tech_stack, currently_building, open_to_work)";

const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-zinc-800 text-zinc-300",
  question: "bg-amber-500/10 text-amber-300",
  hiring: "bg-emerald-500/10 text-emerald-300",
  showdev: "bg-cyan-500/10 text-cyan-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  question: "Question",
  hiring: "Hiring",
  showdev: "ShowDev",
};

type StoryProfile = {
  username: string | null;
  avatar_url: string | null;
} | null;

type StoryRow = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  expires_at: string;
  created_at: string;
  profiles: StoryProfile | StoryProfile[];
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

function StoriesSkeleton() {
  return (
    <div className="border-b border-zinc-800 px-4 py-3">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex w-14 flex-shrink-0 flex-col items-center gap-1.5">
            <div className="h-14 w-14 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-2 w-10 animate-pulse rounded-none bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 3 }).map((_, i) => (
        <article key={i} className="border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-3 w-24 animate-pulse rounded-none bg-zinc-800" />
          </div>
          <div className="aspect-square w-full animate-pulse rounded-none bg-zinc-800" />
          <div className="space-y-2 px-4 pt-3">
            <div className="h-3 w-20 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
          </div>
        </article>
      ))}
    </div>
  );
}

async function StoriesSection() {
  const user = await requireUser();
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: profile }, { data: storiesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("stories")
      .select(
        "id, user_id, media_url, media_type, expires_at, created_at, profiles(username, avatar_url)",
      )
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: true }),
  ]);

  const rows = (storiesData ?? []) as StoryRow[];
  const byUser = new Map<string, StoryUserGroup>();

  for (const row of rows) {
    const p = Array.isArray(row.profiles) ? (row.profiles[0] ?? null) : row.profiles;
    const username = p?.username ?? "unknown_node";
    const avatarUrl = p?.avatar_url ?? null;
    const item: StoryItem = {
      id: row.id,
      user_id: row.user_id,
      media_url: row.media_url,
      media_type: row.media_type,
      expires_at: row.expires_at,
      created_at: row.created_at,
    };
    const existing = byUser.get(row.user_id);
    if (existing) {
      existing.stories.push(item);
    } else {
      byUser.set(row.user_id, {
        userId: row.user_id,
        username,
        avatarUrl,
        stories: [item],
      });
    }
  }

  return (
    <StoriesBar
      currentUser={{
        id: user.id,
        username: profile?.username ?? "unknown_node",
        avatarUrl: profile?.avatar_url ?? null,
      }}
      groups={Array.from(byUser.values())}
    />
  );
}

async function FeedContent() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: outgoingConnections }, { data: incomingConnections }] =
    await Promise.all([
      supabase
        .from("connections")
        .select("addressee_id")
        .eq("requester_id", user.id)
        .eq("status", "accepted"),
      supabase
        .from("connections")
        .select("requester_id")
        .eq("addressee_id", user.id)
        .eq("status", "accepted"),
    ]);

  const connectionIds = [
    ...(outgoingConnections ?? []).map((row) => row.addressee_id as string),
    ...(incomingConnections ?? []).map((row) => row.requester_id as string),
  ];
  const isNetworkEmpty = connectionIds.length === 0;

  let posts: FeedPost[] = [];
  if (isNetworkEmpty) {
    const { data } = await supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .order("created_at", { ascending: false })
      .limit(20);
    posts = (data ?? []) as FeedPost[];
  } else {
    const { data } = await supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .in("user_id", connectionIds)
      .order("created_at", { ascending: false })
      .limit(50);
    posts = (data ?? []) as FeedPost[];
  }

  const postIds = posts.map((p) => p.id);
  const [{ data: boosts }, { data: bookmarks }] = postIds.length
    ? await Promise.all([
        supabase.from("boosts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      ])
    : [{ data: [] }, { data: [] }];

  const boostedSet = new Set((boosts ?? []).map((b) => b.post_id as string));
  const bookmarkedSet = new Set((bookmarks ?? []).map((b) => b.post_id as string));

  return (
    <>
      {isNetworkEmpty ? (
        <div className="border-b border-zinc-800 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400">
          Your network is empty. Connect with people to curate your feed.
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            <Search size={20} strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-base font-semibold text-zinc-100">
            Your feed is quiet
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
            No transmissions yet. Follow tech builders to see their updates.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {posts.map((post, index) => {
            const profile = Array.isArray(post.profiles)
              ? (post.profiles[0] ?? null)
              : post.profiles;
            const username = profile?.username ?? "unknown_node";
            const avatarUrl = profile?.avatar_url ?? null;
            const techStack = Array.isArray(profile?.tech_stack)
              ? profile.tech_stack
              : [];
            const building = profile?.currently_building ?? "";
            const openToWork = Boolean(profile?.open_to_work);
            const shareUrl = `/post/${post.id}`;

            return (
              <FadeIn key={post.id} delay={index * 0.03}>
                <article className="border-b border-zinc-800 bg-[#050505]">
                  <header className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-[#0a0a0a] text-zinc-400">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={`${username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={14} strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {profile?.username ? (
                        <Link
                          href={`/u/${profile.username}`}
                          className="truncate text-sm font-semibold text-zinc-100 transition-colors hover:text-cyan-300"
                        >
                          {username}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold text-zinc-100">{username}</p>
                      )}
                      {openToWork ? (
                        <span className="inline-flex flex-shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Open to Work
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-zinc-500">
                      {formatTimestamp(post.created_at)}
                      {post.is_edited ? <span className="ml-1 normal-case tracking-normal text-zinc-600">(edited)</span> : null}
                    </p>
                  </header>

                  {building || techStack.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
                      {building ? (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-400" />
                          <span className="truncate">Building · {building}</span>
                        </span>
                      ) : null}
                      <TechStackBadges stack={techStack} compact />
                    </div>
                  ) : null}

                  {post.category ? (
                    <div className="px-4 pb-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.general
                        }`}
                      >
                        {CATEGORY_LABELS[post.category] ?? "General"}
                      </span>
                    </div>
                  ) : null}

                  {post.image_url ? (
                    <PostImage
                      postId={post.id}
                      src={post.image_url}
                      alt={post.caption ? post.caption : `Transmission by ${username}`}
                    />
                  ) : null}

                  <PostActions
                    postId={post.id}
                    initialBoosted={boostedSet.has(post.id)}
                    initialBoostCount={post.boost_count ?? 0}
                    threadCount={post.thread_count ?? 0}
                    initialBookmarked={bookmarkedSet.has(post.id)}
                    shareUrl={shareUrl}
                    isOwner={post.user_id === user.id}
                    initialBody={post.body ?? ""}
                    canEdit
                  />

                  <div className="px-4 pb-3">
                    <p className="text-sm font-semibold text-zinc-100">
                      {post.boost_count ?? 0} {(post.boost_count ?? 0) === 1 ? "boost" : "boosts"}
                    </p>

                    {post.body ? (
                      post.is_code_block ? (
                        <div className="mt-2">
                          {!post.image_url ? (
                            <p className="mb-2 text-sm font-semibold text-zinc-100">
                              {username}
                            </p>
                          ) : null}
                          <CodeBlock code={post.body} language={post.language} />
                        </div>
                      ) : (
                        <div className="mt-1 text-base leading-relaxed text-zinc-100 whitespace-pre-wrap break-words">
                          {!post.image_url ? (
                            <span className="mr-2 font-semibold text-zinc-100">{username}</span>
                          ) : null}
                          {parseRichText(post.body)}
                        </div>
                      )
                    ) : null}

                    {post.caption ? (
                      <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                        <span className="mr-2 font-semibold text-zinc-100">{username}</span>
                        {parseRichText(post.caption)}
                      </p>
                    ) : null}

                    {post.thread_count > 0 ? (
                      <Link
                        href={`/post/${post.id}`}
                        className="mt-1 block text-sm text-zinc-500 transition-colors duration-200 ease-out hover:text-zinc-300"
                      >
                        View all {post.thread_count} threads
                      </Link>
                    ) : null}
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function FeedPage() {
  return (
    <section className="native-scroll mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border-b border-zinc-800 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Channel // 01
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
              Feed
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Live data stream. Incoming transmissions decoded below.
            </p>
          </div>
          <Link
            href="/explore"
            aria-label="Explore and search nodes"
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#0a0a0a] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-[#22d3ee] focus-visible:border-[#22d3ee] focus-visible:text-[#22d3ee] focus-visible:outline-none"
          >
            <Search size={16} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <div className="flex flex-col">
        <Suspense fallback={<StoriesSkeleton />}>
          <StoriesSection />
        </Suspense>

        <Suspense fallback={<FeedSkeleton />}>
          <FeedContent />
        </Suspense>
      </div>
    </section>
  );
}
