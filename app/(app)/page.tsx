import { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, Search, Terminal } from "lucide-react";
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
import {
  POST_CATEGORY_BADGE_CLASS,
  categoryLabel,
  feedTabForCategory,
  type FeedTabValue,
} from "@/src/lib/post-categories";
import { FeedTabs } from "./_components/feed-tabs";
import { PollCard } from "@/src/components/poll/poll-card";
import {
  toPollData,
  type PollData,
  type PollRow,
} from "@/src/lib/polls";
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
            <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-900" />
            <div className="h-2 w-10 animate-pulse rounded-md bg-zinc-900" />
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
        <article
          key={i}
          className="flex flex-col gap-4 border-b border-zinc-800 py-4"
        >
          <div className="flex items-center gap-3 px-4">
            <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
            <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-900" />
            <div className="ml-auto h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded-md bg-zinc-900" />
          <div className="aspect-square w-full animate-pulse bg-zinc-900" />
          <div className="flex flex-col gap-2 px-4">
            <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-full animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-900" />
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

async function FeedContent({ activeTab }: { activeTab: FeedTabValue }) {
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

  let postsQuery = supabase.from("posts").select(FEED_POST_SELECT);
  if (activeTab !== "all") {
    postsQuery = postsQuery.eq("category", activeTab);
  }
  if (!isNetworkEmpty) {
    postsQuery = postsQuery.in("user_id", connectionIds);
  }
  const { data: postsData } = await postsQuery
    .order("created_at", { ascending: false })
    .limit(isNetworkEmpty ? 20 : 50);
  const posts = (postsData ?? []) as FeedPost[];

  const postIds = posts.map((p) => p.id);
  const [{ data: boosts }, { data: bookmarks }, { data: polls }] = postIds.length
    ? await Promise.all([
        supabase.from("boosts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase
          .from("polls")
          .select("id, post_id, ends_at, poll_options(id, option_text, vote_count)")
          .in("post_id", postIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const boostedSet = new Set((boosts ?? []).map((b) => b.post_id as string));
  const bookmarkedSet = new Set((bookmarks ?? []).map((b) => b.post_id as string));

  const pollRows = (polls ?? []) as PollRow[];
  const pollIds = pollRows.map((poll) => poll.id);
  const { data: pollVotes } = pollIds.length
    ? await supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("user_id", user.id)
        .in("poll_id", pollIds)
    : { data: [] };

  const votedOptionByPoll = new Map(
    (pollVotes ?? []).map((vote) => [
      vote.poll_id as string,
      vote.option_id as string,
    ]),
  );
  const pollsByPost = new Map<string, PollData>();
  for (const poll of pollRows) {
    pollsByPost.set(
      poll.post_id,
      toPollData(poll, votedOptionByPoll.get(poll.id) ?? null),
    );
  }

  return (
    <>
      {isNetworkEmpty ? (
        <div className="border-b border-zinc-800 px-4 py-3 text-xs text-zinc-500">
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
          <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-zinc-400">
            {activeTab === "all"
              ? "No transmissions yet. Follow tech builders to see their updates."
              : `No ${categoryLabel(activeTab) ?? activeTab} posts in your network yet.`}
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
            const poll = pollsByPost.get(post.id);

            return (
              <FadeIn key={post.id} delay={index * 0.03}>
                <article className="flex flex-col gap-4 border-b border-zinc-800 bg-[#050505] py-4">
                  <header className="flex items-center gap-3 px-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={`${username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={15} strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {profile?.username ? (
                        <Link
                          href={`/u/${profile.username}`}
                          className="truncate text-[15px] font-semibold text-zinc-100 transition-colors hover:text-cyan-400"
                        >
                          {username}
                        </Link>
                      ) : (
                        <p className="truncate text-[15px] font-semibold text-zinc-100">{username}</p>
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
                        alt={post.caption ? post.caption : `Transmission by ${username}`}
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
                                {username}
                              </p>
                            ) : null}
                            <CodeBlock code={post.body} language={post.language} />
                          </div>
                        ) : (
                          <div className="text-[15px] leading-relaxed text-zinc-100 whitespace-pre-wrap break-words">
                            {!post.image_url ? (
                              <span className="mr-2 font-semibold text-white">{username}</span>
                            ) : null}
                            {parseRichText(post.body)}
                          </div>
                        )
                      ) : null}

                      {post.caption ? (
                        <p className="text-[15px] leading-relaxed text-zinc-300">
                          <span className="mr-2 font-semibold text-white">{username}</span>
                          {parseRichText(post.caption)}
                        </p>
                      ) : null}

                      {poll ? <PollCard poll={poll} /> : null}

                      {post.thread_count > 0 ? (
                        <Link
                          href={`/post/${post.id}`}
                          className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                        >
                          View all {post.thread_count} threads
                        </Link>
                      ) : null}
                    </div>
                  </div>

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
                </article>
              </FadeIn>
            );
          })}
        </div>
      )}
    </>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const activeTab = feedTabForCategory(rawCategory);

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
            <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">
              Live data stream. Incoming transmissions decoded below.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href="/messages"
              aria-label="Messages"
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <MessageSquare size={18} strokeWidth={1.8} />
            </Link>
            <Link
              href="/explore"
              aria-label="Explore and search nodes"
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#0a0a0a] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-cyan-400 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none"
            >
              <Search size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>

      <FeedTabs key={activeTab} active={activeTab} />

      <div className="flex flex-col">
        <Suspense fallback={<StoriesSkeleton />}>
          <StoriesSection />
        </Suspense>

        <Suspense fallback={<FeedSkeleton />}>
          <FeedContent activeTab={activeTab} />
        </Suspense>
      </div>
    </section>
  );
}
