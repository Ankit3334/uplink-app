import { Bookmark } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { PostGrid } from "@/src/components/post-grid";
import { createClient } from "@/src/lib/supabase/server";

type BookmarkRow = {
  post_id: string;
};

type SavedPost = {
  id: string;
  image_url: string | null;
  caption: string | null;
  body: string | null;
};

export default async function SavedPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: bookmarkRows } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bookmarks = (bookmarkRows ?? []) as BookmarkRow[];
  const postIds = Array.from(new Set(bookmarks.map((b) => b.post_id)));

  let posts: SavedPost[] = [];
  if (postIds.length > 0) {
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, image_url, caption, body")
      .in("id", postIds);
    const byId = new Map(
      ((postsData ?? []) as SavedPost[]).map((post) => [post.id, post]),
    );
    // Preserve bookmark order (newest save first) rather than post order.
    posts = postIds
      .map((id) => byId.get(id))
      .filter((post): post is SavedPost => Boolean(post));
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          <Bookmark size={13} strokeWidth={1.8} />
          Your library
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
          Saved posts
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
          Transmissions you bookmarked, all in one place.
        </p>
      </header>

      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h2 className="text-base font-semibold tracking-tight text-zinc-100">
          Bookmarks
        </h2>
        <span className="text-xs text-zinc-500">
          {posts.length} saved
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">
            {"// NOTHING SAVED YET"}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">
            Tap the bookmark icon on any post to keep it here.
          </p>
        </div>
      ) : (
        <PostGrid
          posts={posts.map((post) => ({
            id: post.id,
            image_url: post.image_url,
            caption: post.caption,
            body: post.body,
          }))}
        />
      )}
    </section>
  );
}
