import {
  FileText,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/src/lib/auth";
import { PostGrid } from "@/src/components/post-grid";
import { createClient } from "@/src/lib/supabase/server";
import { AvatarUploader } from "./_components/avatar-uploader";
import { DeveloperBento } from "./_components/developer-bento";
import { ProfileEditor } from "./_components/profile-editor";
import {
  SignOutButton,
  SignOutIconButton,
} from "./_components/sign-out-buttons";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={14} strokeWidth={1.8} />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    { data: profile },
    { data: postsData },
    { count: followersCount },
    { count: followingCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, currently_building, tech_stack",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("id, image_url, caption, boost_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id),
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
  const currentlyBuilding =
    typeof profile?.currently_building === "string"
      ? profile.currently_building
      : null;
  const techStack = Array.isArray(profile?.tech_stack)
    ? (profile.tech_stack as string[])
    : [];

  return (
    <section className="native-scroll mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-5 px-4 pt-6 pb-28 animate-fade-in-up">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Channel // 04
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Profile
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Your identity, signal metrics, and node controls.
          </p>
        </div>
        <form action={signOut}>
          <SignOutIconButton />
        </form>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-400">
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
            <p className="truncate text-xl font-semibold tracking-tight text-zinc-50">
              @{username}
            </p>
            <p className="mt-0.5 truncate text-sm text-zinc-300">
              {displayName}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
              {bio || "No bio data written to node."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Followers"
          value={followersCount ?? 0}
          icon={Users}
        />
        <StatCard
          label="Following"
          value={followingCount ?? 0}
          icon={UserCheck}
        />
        <StatCard
          label="Posts"
          value={transmissionsCount}
          icon={FileText}
          hint={`${totalBoosts} total boosts`}
        />
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Status
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
              <Sparkles size={12} strokeWidth={2} />
              Pro Node
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Early operator with priority signal routing.
          </p>
        </div>

        <DeveloperBento
          currentlyBuilding={currentlyBuilding}
          techStack={techStack}
        />
      </div>

      <AvatarUploader initialAvatarUrl={avatarUrl} />

      <ProfileEditor
        initialDisplayName={profile?.display_name ?? ""}
        initialBio={profile?.bio ?? ""}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            Transmission grid
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
    </section>
  );
}
