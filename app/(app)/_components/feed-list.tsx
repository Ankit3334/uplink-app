"use client";

import { memo, useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { getFeedPosts } from "@/app/actions/posts";
import { CodeBlock } from "@/src/components/code-block";
import { FadeIn } from "@/src/components/fade-in";
import { InfiniteScrollTrigger } from "@/src/components/infinite-scroll-trigger";
import { PollCard } from "@/src/components/poll/poll-card";
import { TechStackBadges } from "@/src/components/tech-stack-badges";
import type { FeedItem } from "@/src/lib/feed";
import {
  POST_CATEGORY_BADGE_CLASS,
  categoryLabel,
  type FeedTabValue,
} from "@/src/lib/post-categories";
import { parseRichText } from "@/src/lib/utils";
import { PostActions } from "./post-actions";
import { PostImage } from "./post-image";

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

export const FeedPostCard = memo(function FeedPostCard({
  item,
  currentUserId,
  animationDelay,
}: {
  item: FeedItem;
  currentUserId: string;
  animationDelay: number;
}) {
  const { post, boosted, bookmarked, poll } = item;
  const profile = Array.isArray(post.profiles)
    ? (post.profiles[0] ?? null)
    : post.profiles;
  const username = profile?.username ?? "unknown_node";
  const avatarUrl = profile?.avatar_url ?? null;
  const techStack = Array.isArray(profile?.tech_stack) ? profile.tech_stack : [];
  const building = profile?.currently_building ?? "";
  const openToWork = Boolean(profile?.open_to_work);

  return (
    <FadeIn delay={animationDelay}>
      <article className="flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950 py-4">
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
              <p className="truncate text-[15px] font-semibold text-zinc-100">
                {username}
              </p>
            )}
            {openToWork ? (
              <span className="inline-flex flex-shrink-0 items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                Open to Work
              </span>
            ) : null}
          </div>
          <p className="text-xs text-zinc-500">
            {formatTimestamp(post.created_at)}
            {post.is_edited ? (
              <span className="ml-1 text-zinc-500">(edited)</span>
            ) : null}
          </p>
        </header>

        {building || techStack.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 px-4">
            {building ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300">
                <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-cyan-400" />
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
              {post.boost_count ?? 0}{" "}
              {(post.boost_count ?? 0) === 1 ? "boost" : "boosts"}
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
                    <span className="mr-2 font-semibold text-white">
                      {username}
                    </span>
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
          initialBoosted={boosted}
          initialBoostCount={post.boost_count ?? 0}
          threadCount={post.thread_count ?? 0}
          initialBookmarked={bookmarked}
          shareUrl={`/post/${post.id}`}
          isOwner={post.user_id === currentUserId}
          isPinned={item.pinned}
          initialBody={post.body ?? ""}
          canEdit
        />
      </article>
    </FadeIn>
  );
});

/** Three compact rows that mirror the card rhythm while more posts load. */
function FeedLoadingRows() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading more transmissions…</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={index}
          aria-hidden="true"
          className="border-b border-zinc-800 bg-zinc-950 py-4"
        >
          <div className="flex items-center gap-3 px-4">
            <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
            <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-900" />
            <div className="ml-auto h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
          </div>
          <div className="px-4 pt-4">
            <div className="mb-4 h-24 animate-pulse rounded-lg bg-zinc-900" />
            <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
          </div>
          <div className="px-4 pt-4">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-900" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function FeedList({
  initialItems,
  initialHasMore,
  category,
  currentUserId,
}: {
  initialItems: FeedItem[];
  initialHasMore: boolean;
  category: FeedTabValue;
  currentUserId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const [, startTransition] = useTransition();

  const lastPost = items[items.length - 1]?.post ?? null;
  const cursor = lastPost?.id ?? null;
  const cursorCreatedAt = lastPost?.created_at ?? null;

  const loadMore = useCallback(() => {
    if (!hasMore || !cursor || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const page = await getFeedPosts({ cursor, cursorCreatedAt, category });
        setItems((current) => {
          const seen = new Set(current.map((item) => item.post.id));
          const additions = page.items.filter((item) => !seen.has(item.post.id));
          return additions.length > 0 ? [...current, ...additions] : current;
        });
        setHasMore(page.hasMore);
      } catch {
        setError("Could not load more transmissions. Please retry.");
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    });
  }, [category, cursor, cursorCreatedAt, hasMore]);

  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <FeedPostCard
          key={item.post.id}
          item={item}
          currentUserId={currentUserId}
          animationDelay={Math.min(index * 0.03, 0.18)}
        />
      ))}

      {isLoading ? <FeedLoadingRows /> : null}

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              loadMore();
            }}
            className="flex-shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-400"
          >
            Retry
          </button>
        </div>
      ) : null}

      {hasMore ? (
        <InfiniteScrollTrigger
          onIntersect={loadMore}
          disabled={isLoading || Boolean(error)}
        />
      ) : null}
    </div>
  );
}
