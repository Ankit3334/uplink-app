import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ReelItem } from "./_components/reel-item";

type ReelProfile = {
  username: string | null;
  avatar_url: string | null;
} | null;

type ReelRow = {
  id: string;
  user_id: string;
  video_url: string;
  caption: string | null;
  audio_url: string | null;
  boost_count: number;
  comment_count: number;
  created_at: string;
  profiles: ReelProfile | ReelProfile[];
};

function pickProfile(p: ReelProfile | ReelProfile[]) {
  return Array.isArray(p) ? (p[0] ?? null) : p;
}

export default async function ReelsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("reels")
    .select(
      "id, user_id, video_url, caption, audio_url, boost_count, comment_count, created_at, profiles(username, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const reels = (data ?? []) as ReelRow[];
  const reelIds = reels.map((r) => r.id);

  const [{ data: boosts }, { data: bookmarks }] = reelIds.length
    ? await Promise.all([
        supabase.from("reel_boosts").select("reel_id").eq("user_id", user.id).in("reel_id", reelIds),
        supabase.from("reel_bookmarks").select("reel_id").eq("user_id", user.id).in("reel_id", reelIds),
      ])
    : [{ data: [] }, { data: [] }];

  const boostedSet = new Set((boosts ?? []).map((b) => b.reel_id as string));
  const bookmarkedSet = new Set((bookmarks ?? []).map((b) => b.reel_id as string));

  return (
    <section
      data-immersive
      className="relative h-[calc(100dvh-4rem)] w-full overflow-y-scroll snap-y snap-mandatory bg-[#050505]"
    >
      {reels.length === 0 ? (
        <div className="flex h-[calc(100dvh-4rem)] snap-start snap-always items-center justify-center px-6">
          <div className="w-full max-w-md border-b border-zinc-800 bg-[#050505] p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-300">
              No Reel Signal
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              No reel transmissions detected. Initiate a REEL uplink to populate the stream.
            </p>
          </div>
        </div>
      ) : (
        reels.map((reel) => {
          const profile = pickProfile(reel.profiles);
          const username = profile?.username ?? "unknown_node";
          const avatarUrl = profile?.avatar_url ?? null;

          return (
            <ReelItem
              key={reel.id}
              reelId={reel.id}
              videoUrl={reel.video_url}
              username={username}
              avatarUrl={avatarUrl}
              caption={reel.caption}
              audioLabel={reel.audio_url ? reel.audio_url : "Original Signal"}
              boostCount={reel.boost_count ?? 0}
              commentCount={reel.comment_count ?? 0}
              initialBoosted={boostedSet.has(reel.id)}
              initialBookmarked={bookmarkedSet.has(reel.id)}
            />
          );
        })
      )}
    </section>
  );
}
