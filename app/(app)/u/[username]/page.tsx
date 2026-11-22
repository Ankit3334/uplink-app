import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PostGrid } from "@/src/components/post-grid";
import { ProfileHero } from "@/src/components/professional/profile-hero";
import {
  EducationList,
  ExperienceList,
  SectionCard,
  SkillsList,
} from "@/src/components/professional/profile-sections";
import { getUser } from "@/src/lib/auth";
import { headlineFor } from "@/src/lib/professional";
import {
  getConnectionView,
  getProfessionalData,
  PROFILE_SELECT,
  type ProfileRow,
} from "@/src/lib/professional-queries";
import { createClient } from "@/src/lib/supabase/server";
import { ConnectButton } from "./_components/connect-button";

function ProfileContentSkeleton() {
  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 p-5">
        <div className="h-24 animate-pulse rounded-2xl bg-zinc-800" />
        <div className="-mt-10 h-24 w-24 animate-pulse rounded-full bg-zinc-800" />
        <div className="mt-4 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-56 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-3xl border border-white/5 bg-zinc-900/50"
        />
      ))}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </>
  );
}

async function ProfileContent({ username }: { username: string }) {
  const supabase = await createClient();
  const [currentUser, { data: profileData }] = await Promise.all([
    getUser(),
    supabase.from("profiles").select(PROFILE_SELECT).eq("username", username).maybeSingle(),
  ]);

  if (!profileData) {
    notFound();
  }

  const profile = profileData as ProfileRow;
  const isSelf = currentUser?.id === profile.id;

  const [{ data: postsData }, professionalData, connection] = await Promise.all([
    supabase
      .from("posts")
      .select("id, image_url, caption, boost_count, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(60),
    getProfessionalData(profile.id),
    getConnectionView(currentUser?.id, profile.id),
  ]);

  const posts = postsData ?? [];
  const { experiences, education, skills, connectionsCount } = professionalData;

  const displayName = profile.display_name ?? profile.username;
  const avatarUrl = profile.avatar_url ?? null;
  const bio = profile.bio ?? null;
  const location = profile.location ?? null;
  const openToWork = Boolean(profile.open_to_work);
  const techStack = Array.isArray(profile.tech_stack) ? profile.tech_stack : [];

  return (
    <>
      <ProfileHero
        name={displayName}
        username={profile.username}
        avatarUrl={avatarUrl}
        headline={headlineFor(experiences, profile.currently_building)}
        location={location}
        openToWork={openToWork}
        connectionsCount={connectionsCount}
        isSelf={isSelf}
        action={
          currentUser ? (
            <ConnectButton
              addresseeId={profile.id}
              initialStatus={connection.status}
              initialConnectionId={connection.connectionId}
              isSelf={isSelf}
            />
          ) : null
        }
      />

      {bio ? (
        <SectionCard title="About">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {bio}
          </p>
        </SectionCard>
      ) : null}

      <SectionCard title="Experience">
        <ExperienceList experiences={experiences} />
      </SectionCard>

      <SectionCard title="Education">
        <EducationList education={education} />
      </SectionCard>

      <SectionCard title="Skills">
        <SkillsList skills={skills} />
      </SectionCard>

      {techStack.length > 0 ? (
        <SectionCard title="Tech stack">
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-zinc-800 px-4 py-1.5 text-sm text-zinc-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
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
          canDelete={isSelf}
        />
      </div>
    </>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <section className="native-scroll mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-2xl flex-col gap-5 px-4 pb-28 pt-6 animate-fade-in-up">
      <header>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Professional Profile
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          Member profile
        </h1>
      </header>

      <Suspense fallback={<ProfileContentSkeleton />}>
        <ProfileContent username={username} />
      </Suspense>
    </section>
  );
}
