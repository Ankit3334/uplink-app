import { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { FeedList } from "./_components/feed-list";
import { FeedTabs } from "./_components/feed-tabs";
import {
  StoriesBar,
  type StoryItem,
  type StoryUserGroup,
} from "./_components/stories-bar";
import { requireUser } from "@/src/lib/auth";
import { loadFeedPage } from "@/src/lib/feed";
import {
  categoryLabel,
  feedTabForCategory,
  type FeedTabValue,
} from "@/src/lib/post-categories";
import { createClient } from "@/src/lib/supabase/server";

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
  const feed = await loadFeedPage({ category: activeTab });

  return (
    <>
      {feed.networkEmpty ? (
        <div className="border-b border-zinc-800 px-4 py-3 text-xs text-zinc-500">
          Your network is empty. Connect with people to curate your feed.
        </div>
      ) : null}

      {feed.items.length === 0 ? (
        <div className="u-empty">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
            <Search size={20} strokeWidth={1.8} />
          </div>
          <p className="u-empty-title mt-4">Your feed is quiet</p>
          <p className="u-empty-copy">
            {activeTab === "all"
              ? "No transmissions yet. Follow tech builders to see their updates."
              : `No ${categoryLabel(activeTab) ?? activeTab} posts in your network yet.`}
          </p>
        </div>
      ) : (
        <FeedList
          key={activeTab}
          initialItems={feed.items}
          initialHasMore={feed.hasMore}
          category={activeTab}
          currentUserId={feed.userId}
        />
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
            <Link href="/messages" aria-label="Messages" className="u-icon-btn">
              <MessageSquare size={18} strokeWidth={1.8} />
            </Link>
            <Link
              href="/explore"
              aria-label="Explore and search nodes"
              className="u-icon-btn"
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
