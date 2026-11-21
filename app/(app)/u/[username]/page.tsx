import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import { PostGrid } from "@/src/components/post-grid";
import { createClient } from "@/src/lib/supabase/server";
import { FollowButton } from "./_components/follow-button";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .maybeSingle();

  if (!profileData) {
    notFound();
  }

  const profile = profileData as ProfileRow;

  const [
    { data: postsData },
    { count: followersCount },
    { count: followingCount },
    followRowResult,
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("id, image_url, caption, boost_count, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    currentUser && currentUser.id !== profile.id
      ? supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as { data: { id: string } | null }),
  ]);

  const posts = postsData ?? [];
  const transmissionsCount = posts.length;
  const totalBoosts = posts.reduce(
    (sum, row) => sum + (row.boost_count ?? 0),
    0,
  );

  const isSelf = currentUser?.id === profile.id;
  const canDelete = isSelf;
  const isFollowing = Boolean(followRowResult?.data);
  const displayName = profile.display_name ?? profile.username;
  const avatarUrl = profile.avatar_url ?? null;
  const bio = profile.bio ?? null;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-8 pt-10">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Node Profile // Public
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-zinc-100">
          Operator Record
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Scanning transmissions and identity metadata.
        </p>
      </header>

      <div className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={`${profile.username} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={32} strokeWidth={1.6} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-bold uppercase tracking-[0.08em] text-zinc-100">
                @{profile.username}
              </p>
              <p className="mt-1 truncate text-sm uppercase tracking-[0.12em] text-zinc-300">
                {displayName}
              </p>
              <p className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-500">
                {bio || "No bio data written to node."}
              </p>
            </div>
          </div>
          {!isSelf && currentUser ? (
            <div className="flex-shrink-0 pt-1">
              <FollowButton
                followingId={profile.id}
                initialIsFollowing={isFollowing}
                isSelf={isSelf}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Transmissions
          </p>
          <p className="mt-3 text-xl font-bold text-zinc-100">
            {transmissionsCount}
          </p>
        </div>
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Total Boosts
          </p>
          <p className="mt-3 text-xl font-bold text-zinc-100">{totalBoosts}</p>
        </div>
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Followers
          </p>
          <p className="mt-3 text-xl font-bold text-zinc-100">
            {followersCount ?? 0}
          </p>
        </div>
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Following
          </p>
          <p className="mt-3 text-xl font-bold text-zinc-100">
            {followingCount ?? 0}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-100">
            Transmission Grid
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            {transmissionsCount} records
          </span>
        </div>
        <PostGrid
          posts={posts.map((p) => ({
            id: p.id as string,
            image_url: p.image_url as string,
            caption: (p.caption as string | null) ?? null,
          }))}
          canDelete={canDelete}
        />
      </div>
    </section>
  );
}
