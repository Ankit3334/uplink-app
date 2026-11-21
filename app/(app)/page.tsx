import Link from "next/link";
import { MessageSquare, Terminal } from "lucide-react";
import { BoostForm } from "./_components/boost-form";
import { FadeIn } from "@/src/components/fade-in";
import { createClient } from "@/src/lib/supabase/server";

type FeedProfile = {
  username: string | null;
  avatar_url: string | null;
} | null;

type FeedPost = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  boost_count: number;
  thread_count: number;
  created_at: string;
  profiles: FeedProfile | FeedProfile[];
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

export default async function FeedPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, user_id, image_url, caption, boost_count, thread_count, created_at, profiles(username, avatar_url)",
    )
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as FeedPost[];

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-10">
      <header className="border border-neon-cyan/30 bg-[#0a0a0a] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          Channel // 01
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight glow-cyan">
          Feed
        </h1>
        <p className="mt-2 text-xs text-[#a0a0a0]">
          Live data stream. Incoming transmissions decoded below.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 text-sm text-[#8a8a8a]">
          <p className="uppercase tracking-[0.15em] text-[#39ff14] glow-green">
            Status: Awaiting Signal
          </p>
          <p className="mt-3 leading-relaxed">
            No uplinks detected. Initiate a transmission to populate the stream.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post, index) => {
            const profile = Array.isArray(post.profiles)
              ? (post.profiles[0] ?? null)
              : post.profiles;
            const username = profile?.username ?? "unknown_node";
            const avatarUrl = profile?.avatar_url ?? null;

            return (
              <FadeIn key={post.id} delay={index * 0.04}>
                <article className="border border-neon-cyan/20 bg-[#0a0a0a]">
                  <header className="flex items-center gap-3 border-b border-[#1a1a1a] p-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-neon-green/40 bg-[#050505] text-[#39ff14]">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={`${username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {profile?.username ? (
                        <Link
                          href={`/u/${profile.username}`}
                          className="block truncate text-sm font-bold uppercase tracking-[0.08em] text-[#39ff14] glow-green hover:underline"
                        >
                          @{username}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-bold uppercase tracking-[0.08em] text-[#39ff14] glow-green">
                          @{username}
                        </p>
                      )}
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777]">
                        {formatTimestamp(post.created_at)}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#444]">
                      PKT
                    </span>
                  </header>

                  <div className="p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={
                        post.caption ? post.caption : `Transmission by ${username}`
                      }
                      className="w-full rounded-none border border-cyan-500/30 object-cover"
                      loading="lazy"
                    />
                  </div>

                  {post.caption ? (
                    <div className="px-3 pb-3">
                      <p className="whitespace-pre-wrap border-l-2 border-neon-cyan/30 pl-3 font-mono text-sm leading-relaxed text-[#d0d0d0]">
                        {post.caption}
                      </p>
                    </div>
                  ) : null}

                  <footer className="flex items-center gap-2 border-t border-[#1a1a1a] p-3">
                    <BoostForm postId={post.id} count={post.boost_count ?? 0} />
                    <Link
                      href={`/post/${post.id}`}
                      className="group flex items-center gap-2 border border-neon-magenta/30 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#a0a0a0] transition-colors hover:border-[#ff00ff] hover:text-[#ff00ff] hover:shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                    >
                      <MessageSquare
                        size={16}
                        className="transition-colors group-hover:text-[#ff00ff] group-hover:drop-shadow-[0_0_6px_rgba(255,0,255,0.8)]"
                      />
                      <span>Thread</span>
                      <span className="text-[#ff00ff]">
                        [{post.thread_count ?? 0}]
                      </span>
                    </Link>
                  </footer>
                </article>
              </FadeIn>
            );
          })}
        </div>
      )}
    </section>
  );
}
