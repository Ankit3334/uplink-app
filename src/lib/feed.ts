import { requireUser } from "@/src/lib/auth";
import { toPollData, type PollData, type PollRow } from "@/src/lib/polls";
import { feedTabForCategory, type FeedTabValue } from "@/src/lib/post-categories";
import { createClient } from "@/src/lib/supabase/server";

export const FEED_PAGE_SIZE = 15;

export type FeedProfile = {
  username: string | null;
  avatar_url: string | null;
  tech_stack: string[] | null;
  currently_building: string | null;
  open_to_work: boolean | null;
} | null;

export type FeedPost = {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  body: string | null;
  category: string | null;
  boost_count: number;
  thread_count: number;
  /** Older schemas named this comment_count; tolerate both. */
  comment_count?: number | null;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean | null;
  is_code_block: boolean | null;
  language: string | null;
  profiles: FeedProfile | FeedProfile[];
};

export type FeedItem = {
  post: FeedPost;
  boosted: boolean;
  bookmarked: boolean;
  pinned: boolean;
  poll: PollData | null;
};

export type FeedPageResult = {
  items: FeedItem[];
  hasMore: boolean;
  userId: string;
  networkEmpty: boolean;
};

/** Add viewer-specific state to already-selected post rows. */
export async function hydrateFeedItems(
  posts: FeedPost[],
  viewerId: string,
  pinnedPostId: string | null = null,
): Promise<FeedItem[]> {
  if (posts.length === 0) return [];

  const supabase = await createClient();
  const postIds = posts.map((post) => post.id);

  const [{ data: boosts }, { data: bookmarks }, { data: polls }] =
    await Promise.all([
      supabase
        .from("boosts")
        .select("post_id")
        .eq("user_id", viewerId)
        .in("post_id", postIds),
      supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", viewerId)
        .in("post_id", postIds),
      supabase
        .from("polls")
        .select("id, post_id, ends_at, poll_options(id, option_text, vote_count)")
        .in("post_id", postIds),
    ]);

  const boostedSet = new Set((boosts ?? []).map((row) => row.post_id as string));
  const bookmarkedSet = new Set(
    (bookmarks ?? []).map((row) => row.post_id as string),
  );

  const pollRows = (polls ?? []) as PollRow[];
  const pollIds = pollRows.map((poll) => poll.id);
  const { data: pollVotes } = pollIds.length
    ? await supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("user_id", viewerId)
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

  return posts.map((post) => ({
    post,
    boosted: boostedSet.has(post.id),
    bookmarked: bookmarkedSet.has(post.id),
    pinned: pinnedPostId === post.id,
    poll: pollsByPost.get(post.id) ?? null,
  }));
}

/** Normalize to a Z-suffixed ISO string so the PostgREST filter is URL-safe. */
function toCursorTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

/**
 * Shared feed reader for the initial server render and cursor-based "load
 * more" calls. The cursor is the last loaded post id: we resolve its timestamp,
 * then page strictly older rows with an id tie-breaker for equal timestamps.
 */
export async function loadFeedPage({
  cursor = null,
  category = "all",
}: {
  cursor?: string | null;
  category?: FeedTabValue;
}): Promise<FeedPageResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const activeTab = feedTabForCategory(category);

  const [
    { data: outgoingConnections },
    { data: incomingConnections },
    { data: ownProfile },
  ] = await Promise.all([
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
    supabase
      .from("profiles")
      .select("pinned_post_id")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const connectionIds = [
    ...(outgoingConnections ?? []).map((row) => row.addressee_id as string),
    ...(incomingConnections ?? []).map((row) => row.requester_id as string),
  ];
  const networkEmpty = connectionIds.length === 0;

  let cursorTimestamp: string | null = null;
  if (cursor) {
    const { data: cursorRow } = await supabase
      .from("posts")
      .select("created_at")
      .eq("id", cursor)
      .maybeSingle();

    if (!cursorRow?.created_at) {
      return { items: [], hasMore: false, userId: user.id, networkEmpty };
    }
    cursorTimestamp = toCursorTimestamp(cursorRow.created_at as string);
  }

  const buildPostsQuery = (networkOnly: boolean) => {
    let query = supabase.from("posts").select("*, profiles(*)");
    if (activeTab !== "all") {
      query = query.eq("category", activeTab);
    }
    if (networkOnly && !networkEmpty) {
      query = query.in("user_id", connectionIds);
    }
    if (cursor && cursorTimestamp) {
      query = query.or(
        `created_at.lt.${cursorTimestamp},and(created_at.eq.${cursorTimestamp},id.lt.${cursor})`,
      );
    }
    return query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(FEED_PAGE_SIZE);
  };

  const { data: postsData, error: postsError } = await buildPostsQuery(true);
  if (postsError) {
    console.error("Feed query error:", postsError);
  }

  let posts = (postsData ?? []) as FeedPost[];

  // A connected account with no posts from its network should still see the
  // global stream instead of an empty feed.
  if (!networkEmpty && posts.length === 0 && !cursor) {
    const { data: globalData, error: globalError } = await buildPostsQuery(false);
    if (globalError) {
      console.error("Feed fallback query error:", globalError);
    }
    posts = (globalData ?? []) as FeedPost[];
  }

  console.log("Feed Posts:", posts);

  const pinnedPostId = (ownProfile?.pinned_post_id as string | null) ?? null;

  return {
    items: await hydrateFeedItems(posts, user.id, pinnedPostId),
    hasMore: posts.length === FEED_PAGE_SIZE,
    userId: user.id,
    networkEmpty,
  };
}
