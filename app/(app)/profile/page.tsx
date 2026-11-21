import { Terminal } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/src/lib/auth";
import { PostGrid } from "@/src/components/post-grid";
import { createClient } from "@/src/lib/supabase/server";
import { AvatarUploader } from "./_components/avatar-uploader";
import { ProfileEditor } from "./_components/profile-editor";
import {
  SignOutButton,
  SignOutIconButton,
} from "./_components/sign-out-buttons";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: postsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("id, image_url, caption, boost_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

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
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Channel // 04
            </p>
            <h1 className="mt-2 text-xl font-bold uppercase tracking-wider text-zinc-100">
              Node Configuration
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Operator identity, signal metrics, and profile controls.
            </p>
          </div>
          <form action={signOut}>
            <SignOutIconButton />
          </form>
        </div>
      </header>

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-400">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={`${username} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={32} strokeWidth={1.6} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold uppercase tracking-[0.08em] text-zinc-100">
                @{username}
              </p>
              <p className="mt-1 truncate text-xs uppercase tracking-[0.12em] text-zinc-300">
                {displayName}
              </p>
              <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-500">
                {bio || "No bio data written to node."}
              </p>
            </div>
          </div>
        </div>

        <AvatarUploader initialAvatarUrl={avatarUrl} />

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-zinc-800 bg-[#0a0a0a] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              Transmissions
            </p>
            <p className="mt-2 text-lg font-bold text-zinc-100">
              {transmissionsCount ?? 0}
            </p>
          </div>
          <div className="border border-zinc-800 bg-[#0a0a0a] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              Total Boosts
            </p>
            <p className="mt-2 text-lg font-bold text-zinc-100">{totalBoosts}</p>
          </div>
          <div className="border border-zinc-800 bg-[#0a0a0a] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              Node Level
            </p>
            <p className="mt-2 inline-block border border-zinc-700 bg-[#111111] px-2 py-0.5 font-mono text-base font-bold text-[#22d3ee]">
              1
            </p>
          </div>
        </div>

        <ProfileEditor
          initialDisplayName={profile?.display_name ?? ""}
          initialBio={profile?.bio ?? ""}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
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
            canDelete
            deleteRedirectTo="/profile"
          />
        </div>

        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </section>
  );
}
