import Link from "next/link";
import { MessageSquare, Terminal } from "lucide-react";
import { BoostForm } from "./_components/boost-form";
import { FadeIn } from "@/src/components/fade-in";
import { requireUser } from "@/src/lib/auth";
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
  const user = await requireUser();
  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (follows ?? []).map((f) => f.following_id as string);
  const isNetworkEmpty = followingIds.length === 0;

  let posts: FeedPost[] = [];

  if (isNetworkEmpty) {
    const { data } = await supabase
      .from("posts")
      .select(
        "id, user_id, image_url, caption, boost_count, thread_count, created_at, profiles(username, avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(20);
    posts = (data ?? []) as FeedPost[];
  } else {
    const { data } = await supabase
      .from("posts")
      .select(
        "id, user_id, image_url, caption, boost_count, thread_count, created_at, profiles(username, avatar_url)",
      )
      .in("user_id", followingIds)
      .order("created_at", { ascending: false });
    posts = (data ?? []) as FeedPost[];
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-8 pt-10">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // 01
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-zinc-100">
          Feed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Live data stream. Incoming transmissions decoded below.
        </p>
      </header>

      {isNetworkEmpty ? (
        <div className="border border-zinc-700 bg-[#111111] p-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
          NETWORK EMPTY. FOLLOW NODES TO CURATE YOUR STREAM.
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="border border-zinc-800 bg-[#0a0a0a] p-6 text-sm text-zinc-400">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-300">
            Status: Awaiting Signal
          </p>
          <p className="mt-3 leading-relaxed">
            {isNetworkEmpty
              ? "No uplinks detected in the global network. Initiate a transmission to populate the stream."
              : "No transmissions detected from followed nodes. Follow more nodes or wait for new uplinks."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post, index) => {
            const profile = Array.isArray(post.profiles)
              ? (post.profiles[0] ?? null)
              : post.profiles;
            const username = profile?.username ?? "unknown_node";
            const avatarUrl = profile?.avatar_url ?? null;

            return (
              <FadeIn key={post.id} delay={index * 0.04}>
                <article className="border border-zinc-800 bg-[#0a0a0a]">
                  <header className="flex items-center gap-3 border-b border-zinc-800 p-4">
                    <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={`${username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={18} strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {profile?.username ? (
                        <Link
                          href={`/u/${profile.username}`}
                          className="block truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100 transition-colors hover:text-[#22d3ee]"
                        >
                          @{username}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100">
                          @{username}
                        </p>
                      )}
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                        {formatTimestamp(post.created_at)}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                      PKT
                    </span>
                  </header>

                  <div className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={
                        post.caption ? post.caption : `Transmission by ${username}`
                      }
                      className="w-full rounded-none border border-zinc-800 object-cover"
                      loading="lazy"
                    />
                  </div>

                  {post.caption ? (
                    <div className="px-4 pb-4">
                      <p className="whitespace-pre-wrap border-l border-zinc-700 pl-4 font-mono text-sm leading-relaxed text-zinc-300">
                        {post.caption}
                      </p>
                    </div>
                  ) : null}

                  <footer className="flex items-center gap-2 border-t border-zinc-800 p-4">
                    <BoostForm postId={post.id} count={post.boost_count ?? 0} />
                    <Link
                      href={`/post/${post.id}`}
                      className="group flex items-center gap-2 border border-zinc-800 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 focus-visible:border-[#22d3ee] focus-visible:text-[#22d3ee] focus-visible:outline-none"
                    >
                      <MessageSquare
                        size={15}
                        className="transition-colors duration-200 ease-in-out group-hover:text-zinc-200 group-focus-visible:text-[#22d3ee]"
                      />
                      <span>Thread</span>
                      <span className="font-mono text-zinc-500 group-hover:text-zinc-300 group-focus-visible:text-[#22d3ee]">
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
