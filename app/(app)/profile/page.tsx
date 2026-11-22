import Link from "next/link";
import { FileText, Settings, Sparkles, Users, type LucideIcon } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/src/lib/auth";
import { PostGrid } from "@/src/components/post-grid";
import { ProfileHero } from "@/src/components/professional/profile-hero";
import {
  ProjectSection,
  type ProjectCardData,
} from "@/src/components/professional/project-showcase";
import {
  SectionCard,
} from "@/src/components/professional/profile-sections";
import {
  getProfessionalData,
  PROFILE_SELECT,
  type ProfileRow,
} from "@/src/lib/professional-queries";
import { headlineFor } from "@/src/lib/professional";
import { createClient } from "@/src/lib/supabase/server";
import { AvatarUploader } from "./_components/avatar-uploader";
import { DeveloperBento } from "./_components/developer-bento";
import { ProfileEditor } from "./_components/profile-editor";
import { ProfessionalManager } from "./_components/professional-manager";
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={14} strokeWidth={1.8} />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profileData }, { data: postsData }, { data: projectsData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("posts")
        .select("id, image_url, caption, boost_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase
        .from("projects")
        .select(
          "id, title, description, link, tech_stack, image_url",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const profile = profileData as ProfileRow | null;
  const { experiences, education, skills, connectionsCount } =
    await getProfessionalData(user.id);

  const posts = postsData ?? [];
  const projects = (projectsData ?? []) as ProjectCardData[];
  const totalBoosts = posts.reduce(
    (sum, row) => sum + (row.boost_count ?? 0),
    0,
  );

  const username = profile?.username ?? "uplink_user";
  const displayName = profile?.display_name ?? username;
  const avatarUrl = profile?.avatar_url ?? null;
  const bio = profile?.bio ?? null;
  const location = profile?.location ?? null;
  const openToWork = Boolean(profile?.open_to_work);
  const currentlyBuilding =
    typeof profile?.currently_building === "string"
      ? profile.currently_building
      : null;
  const techStack = Array.isArray(profile?.tech_stack)
    ? (profile.tech_stack as string[])
    : [];

  return (
    <section className="native-scroll mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-2xl flex-col gap-5 px-4 pt-6 pb-28 animate-fade-in-up">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Professional Profile
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Your profile
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">
            Build your professional presence on UPLINK.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-10 w-10 items-center justify-center border border-zinc-700 bg-[#111111] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none"
          >
            <Settings size={18} strokeWidth={1.8} />
          </Link>
          <form action={signOut}>
            <SignOutIconButton />
          </form>
        </div>
      </header>

      <ProfileHero
        name={displayName}
        username={username}
        avatarUrl={avatarUrl}
        headline={headlineFor(experiences, currentlyBuilding)}
        location={location}
        openToWork={openToWork}
        connectionsCount={connectionsCount}
        isSelf
      />

      <SectionCard title="About" description="Your professional summary.">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
          {bio || "Add a short introduction so people know what you do."}
        </p>
      </SectionCard>

      <ProjectSection projects={projects} isSelf />

      <ProfileEditor
        initialDisplayName={profile?.display_name ?? ""}
        initialBio={profile?.bio ?? ""}
        initialLocation={profile?.location ?? ""}
        initialOpenToWork={openToWork}
      />

      <ProfessionalManager
        experiences={experiences}
        education={education}
        skills={skills}
      />

      <DeveloperBento
        currentlyBuilding={currentlyBuilding}
        techStack={techStack}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Connections"
          value={connectionsCount}
          icon={Users}
          hint="Accepted invitations"
        />
        <StatCard
          label="Posts"
          value={posts.length}
          icon={FileText}
          hint={`${totalBoosts} boosts received`}
        />
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <Sparkles size={14} strokeWidth={1.8} />
            Status
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
              Pro Node
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Early builder with priority signal routing.
          </p>
        </div>
      </div>

      <AvatarUploader initialAvatarUrl={avatarUrl} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            Activity
          </h2>
          <span className="text-xs text-zinc-500">
            {posts.length} post{posts.length === 1 ? "" : "s"}
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
