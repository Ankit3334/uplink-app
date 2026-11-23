"use client";

import { useActionState, useState } from "react";
import { ExternalLink, FolderKanban, Plus } from "lucide-react";
import { createProject } from "@/app/actions/projects";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { triggerHaptic } from "@/src/lib/utils";

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  link: string | null;
  tech_stack: string[] | null;
  image_url: string | null;
};

const fieldClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-[15px] leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400";

function ProjectCard({ project }: { project: ProjectCardData }) {
  const hasLink = Boolean(project.link);
  const tech = Array.isArray(project.tech_stack) ? project.tech_stack : [];

  return (
    <article className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-zinc-700">
      {hasLink ? (
        <a
          href={project.link ?? "#"}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${project.title}`}
          className="absolute right-3 top-3 text-zinc-500 transition-colors hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none"
        >
          <ExternalLink size={13} strokeWidth={1.8} />
        </a>
      ) : null}

      {project.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image_url}
          alt={`${project.title} preview`}
          className="mb-3 h-24 w-full rounded-lg border border-zinc-800 object-cover"
          loading="lazy"
        />
      ) : null}

      <h3 className={`font-semibold text-white ${hasLink ? "pr-6" : ""}`}>
        {project.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-zinc-400">
        {project.description}
      </p>

      {tech.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tech.slice(0, 6).map((item) => (
            <span
              key={item}
              className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ProjectSection({
  projects,
  isSelf,
}: {
  projects: ProjectCardData[];
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProject, {});
  const [ackSuccess, setAckSuccess] = useState<number | null>(null);

  // Each successful save returns a fresh token, so every save closes the
  // sheet – including when adding several projects in one session.
  const successToken = typeof state.success === "number" ? state.success : null;
  if (successToken !== null && successToken !== ackSuccess) {
    setAckSuccess(successToken);
    setOpen(false);
  }

  const toggleOpen = () => {
    triggerHaptic();
    setOpen((value) => !value);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Projects
          </h2>
          <p className="mt-1 text-[15px] font-semibold leading-relaxed text-zinc-100">
            Things I&apos;ve built
          </p>
        </div>
        {isSelf ? (
          <button
            type="button"
            onClick={toggleOpen}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40"
          >
            <Plus size={12} strokeWidth={2} />
            Add Project
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <FolderKanban
              size={18}
              strokeWidth={1.8}
              className="mx-auto text-zinc-500"
            />
            <p className="mt-2 text-xs text-zinc-500">
              {isSelf
                ? "No projects shared yet. Add your first one."
                : "No projects shared yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {isSelf ? (
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Add project">
          <form action={formAction} className="space-y-4 bg-zinc-950">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Title
              </span>
              <input
                name="title"
                required
                maxLength={120}
                placeholder="Side project, launch, open source tool..."
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Description
              </span>
              <textarea
                name="description"
                required
                rows={3}
                maxLength={600}
                placeholder="What does it do and why did you build it?"
                className={`${fieldClass} resize-y`}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Link <span className="text-zinc-500">(optional)</span>
              </span>
              <input
                name="link"
                type="url"
                placeholder="https://..."
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Tech stack <span className="text-zinc-500">(comma separated)</span>
              </span>
              <input
                name="tech_stack"
                placeholder="Next.js, TypeScript, Supabase"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Image URL <span className="text-zinc-500">(optional)</span>
              </span>
              <input
                name="image_url"
                type="url"
                placeholder="https://..."
                className={fieldClass}
              />
            </label>

            {state.error ? (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {state.error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                onClick={triggerHaptic}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </BottomSheet>
      ) : null}
    </section>
  );
}
