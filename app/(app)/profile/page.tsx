import { LogOut, Terminal } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/src/lib/auth";
import { PostGrid } from "@/src/components/post-grid";
import { createClient } from "@/src/lib/supabase/server";
import { ProfileEditor } from "./_components/profile-editor";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();

  const { data: postsData } = await supabase
    .from("posts")
    .select("id, image_url, caption, boost_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = postsData ?? [];
  const transmissionsCount = posts.length;
  const totalBoosts = posts.reduce(
    (sum, row) => sum + (row.boost_count ?? 0),
    0,
  );

  const username = profile?.username ?? "unknown_node";
  const displayName = profile?.display_name ?? username;
  const avatarUrl = profile?.avatar_url ?? null;
  const bio = profile?.bio ?? null;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-10">
      <header className="border border-neon-green/30 bg-[#0a0a0a] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
              Channel // 04
            </p>
            <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight glow-green">
              Node Configuration
            </h1>
            <p className="mt-2 text-xs text-[#a0a0a0]">
              Operator identity, signal metrics, and profile controls.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sever connection"
              title="Sever connection"
              className="flex h-10 w-10 items-center justify-center border border-neon-magenta bg-transparent text-[#ff00ff] transition-colors hover:bg-[#ff00ff]/15 hover:shadow-[0_0_10px_rgba(255,0,255,0.3)]"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      <div className="border border-neon-green/20 bg-[#0a0a0a] p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center border border-neon-green/40 bg-[#050505] text-[#39ff14]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Terminal size={36} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold uppercase tracking-[0.08em] text-[#39ff14] glow-green">
              @{username}
            </p>
            <p className="mt-1 truncate text-sm uppercase tracking-[0.12em] text-[#d0d0d0]">
              {displayName}
            </p>
            <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#8a8a8a]">
              {bio || "No bio data written to node."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="border border-neon-cyan/30 bg-[#0a0a0a] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#777]">
            Transmissions
          </p>
          <p className="mt-2 text-xl font-bold text-[#00f3ff] glow-cyan">
            {transmissionsCount ?? 0}
          </p>
        </div>
        <div className="border border-neon-green/30 bg-[#0a0a0a] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#777]">
            Total Boosts
          </p>
          <p className="mt-2 text-xl font-bold text-[#39ff14] glow-green">
            {totalBoosts}
          </p>
        </div>
        <div className="border border-neon-magenta/30 bg-[#0a0a0a] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#777]">
            Node Level
          </p>
          <p className="mt-2 inline-block border border-neon-magenta/50 bg-[#ff00ff]/10 px-2 py-0.5 text-lg font-bold text-[#ff00ff]">
            1
          </p>
        </div>
      </div>

      <ProfileEditor
        initialDisplayName={profile?.display_name ?? ""}
        initialBio={profile?.bio ?? ""}
      />

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-[#1f1f1f] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00f3ff]">
            Transmission Grid
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
            {transmissionsCount} records
          </span>
        </div>
        <PostGrid
          posts={posts.map((p) => ({
            id: p.id as string,
            image_url: p.image_url as string,
            caption: (p.caption as string | null) ?? null,
          }))}
          canDelete
          deleteRedirectTo="/profile"
        />
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full border border-neon-magenta bg-transparent px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ff00ff] transition-colors hover:bg-[#ff00ff]/10 hover:shadow-[0_0_12px_rgba(255,0,255,0.25)]"
        >
          Sever Connection
        </button>
      </form>
    </section>
  );
}
