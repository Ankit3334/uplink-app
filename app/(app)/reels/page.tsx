import { Terminal } from "lucide-react";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ReelActions } from "./_components/reel-actions";
import { ReelVideo } from "./_components/reel-video";

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
  await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("reels")
    .select(
      "id, user_id, video_url, caption, audio_url, boost_count, comment_count, created_at, profiles(username, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const reels = (data ?? []) as ReelRow[];

  return (
    <section
      data-immersive
      className="relative h-[calc(100dvh-4rem)] w-full overflow-y-scroll snap-y snap-mandatory bg-[#050505]"
    >
      {reels.length === 0 ? (
        <div className="flex h-[calc(100dvh-4rem)] snap-start snap-always items-center justify-center px-6">
          <div className="w-full max-w-md border border-zinc-800 bg-[#0a0a0a] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-300">
              Status: No Reel Signal
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              No reel transmissions detected. Initiate a REEL uplink to populate
              the stream.
            </p>
          </div>
        </div>
      ) : (
        reels.map((reel) => {
          const profile = pickProfile(reel.profiles);
          const username = profile?.username ?? "unknown_node";
          const avatarUrl = profile?.avatar_url ?? null;

          return (
            <article
              key={reel.id}
              id={reel.id}
              className="relative flex h-[calc(100dvh-4rem)] w-full snap-start snap-always items-center justify-center bg-[#050505]"
            >
              <div className="absolute inset-0">
                <ReelVideo src={reel.video_url} />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-transparent to-[#050505]/70" />

              <ReelActions
                reelId={reel.id}
                boostCount={reel.boost_count ?? 0}
                commentCount={reel.comment_count ?? 0}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pr-20 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-zinc-700 bg-[#111111]/90 text-zinc-300">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={`${username} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Terminal size={16} strokeWidth={1.8} />
                    )}
                  </div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-zinc-100">
                    @{username}
                  </p>
                </div>

                {reel.caption ? (
                  <p className="mt-3 max-w-[85%] whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-200">
                    {reel.caption}
                  </p>
                ) : null}

                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Audio: {reel.audio_url ? reel.audio_url : "Original Signal"}
                </p>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
