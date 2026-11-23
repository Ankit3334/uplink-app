import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { PostGrid } from "@/src/components/post-grid";
import { UserSearch } from "./_components/user-search";

export default async function ExplorePage() {
  await requireUser();
  const supabase = await createClient();

  const { data: postsData } = await supabase
    .from("posts")
    .select("id, image_url, caption, boost_count, created_at")
    .order("boost_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  const posts = (postsData ?? []).map((p) => ({
    id: p.id as string,
    image_url: p.image_url as string,
    caption: (p.caption as string | null) ?? null,
  }));

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-zinc-950 p-4">
        <p className="eyebrow">
          Channel // Explore
        </p>
        <h1 className="page-title">
          Explore
        </h1>
        <p className="page-subtitle">
          Search nodes and scan high-signal transmissions across the network.
        </p>
      </header>

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
        <div className="border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Node Search
          </p>
          <UserSearch />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-100">
              Explore Grid
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              Top Signals
            </span>
          </div>
          <PostGrid posts={posts} />
        </div>
      </div>
    </section>
  );
}
