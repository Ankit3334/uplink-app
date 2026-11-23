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
  created_at: string;
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

export const FEED_POST_SELECT =
  "id, user_id, image_url, caption, body, category, boost_count, thread_count, created_at, is_edited, is_code_block, language, profiles(username, avatar_url, tech_stack, currently_building, open_to_work)";

/** Add viewer-specific state to already-selected post rows. */
export async function hydrateFeedItems(
  posts: FeedPost[],
  viewerId: string,
  pinnedPostId: string | null = null,
): Promise<FeedItem[]> {
  if (posts.length === 0) return [];

  const supabase = await createClient();
  const postIds = posts.map((post) => post.id);
  const emptyPostRefs = Promise.resolve({ data: [] as { post_id: string }[] });

  // Polls are public, but viewer-specific boost/bookmark/vote state is not.
  // Anonymous profile views skip those lookups instead of querying with an
  // impossible user id.
  const [{ data: boosts }, { data: bookmarks }, { data: polls }] =
    await Promise.all([
      viewerId
        ? supabase
            .from("boosts")
            .select("post_id")
            .eq("user_id", viewerId)
            .in("post_id", postIds)
        : emptyPostRefs,
      viewerId
        ? supabase
            .from("bookmarks")
            .select("post_id")
            .eq("user_id", viewerId)
            .in("post_id", postIds)
        : emptyPostRefs,
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
  const { data: pollVotes } =
    viewerId && pollIds.length
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
  cursorCreatedAt = null,
  category = "all",
}: {
  cursor?: string | null;
  cursorCreatedAt?: string | null;
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

  let postsQuery = supabase.from("posts").select(FEED_POST_SELECT);
  if (activeTab !== "all") {
    postsQuery = postsQuery.eq("category", activeTab);
  }
  if (!networkEmpty) {
    postsQuery = postsQuery.in("user_id", connectionIds);
  }

  if (cursor) {
    let timestamp = cursorCreatedAt ? toCursorTimestamp(cursorCreatedAt) : null;

    if (!timestamp) {
      const { data: cursorRow } = await supabase
        .from("posts")
        .select("created_at")
        .eq("id", cursor)
        .maybeSingle();

      if (!cursorRow?.created_at) {
        return { items: [], hasMore: false, userId: user.id, networkEmpty };
      }
      timestamp = toCursorTimestamp(cursorRow.created_at as string);
    }

    postsQuery = postsQuery.or(
      `created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${cursor})`,
    );
  }

  const { data: postsData } = await postsQuery
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  const posts = (postsData ?? []) as FeedPost[];
  const pinnedPostId = (ownProfile?.pinned_post_id as string | null) ?? null;

  return {
    items: await hydrateFeedItems(posts, user.id, pinnedPostId),
    hasMore: posts.length === FEED_PAGE_SIZE,
    userId: user.id,
    networkEmpty,
  };
}
