import type { ReactNode } from "react";
import { GraduationCap, Pencil, Trash2, X } from "lucide-react";
import {
  experiencePeriod,
  type Education,
  type Experience,
  type Skill,
} from "@/src/lib/professional";

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[15px] leading-relaxed text-zinc-500">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-full border border-zinc-700 bg-zinc-800/70 p-1.5 text-zinc-400 transition-colors hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

export function ExperienceList({
  experiences,
  onEdit,
  onDelete,
}: {
  experiences: Experience[];
  onEdit?: (item: Experience) => void;
  onDelete?: (id: string) => void;
}) {
  if (experiences.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-zinc-500">
        No experience added yet.
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {experiences.map((item, index) => (
        <li key={item.id} className="relative flex gap-4 pl-1">
          <div className="relative flex flex-col items-center">
            <span className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full border-2 border-zinc-950 bg-cyan-400" />
            {index < experiences.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-zinc-800" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-[15px] text-zinc-400">
                  {item.company}
                </p>
              </div>
              {onEdit || onDelete ? (
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {onEdit ? (
                    <IconAction label="Edit experience" onClick={() => onEdit(item)}>
                      <Pencil size={13} />
                    </IconAction>
                  ) : null}
                  {onDelete ? (
                    <IconAction
                      label="Delete experience"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 size={13} />
                    </IconAction>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              {experiencePeriod(item)}
              {item.is_current ? (
                <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
                  Current
                </span>
              ) : null}
            </p>
            {item.description ? (
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
                {item.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EducationList({
  education,
  onEdit,
  onDelete,
}: {
  education: Education[];
  onEdit?: (item: Education) => void;
  onDelete?: (id: string) => void;
}) {
  if (education.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-zinc-500">
        No education added yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {education.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3"
        >
          <div className="mt-0.5 rounded-full bg-zinc-800 p-2 text-zinc-400">
            <GraduationCap size={16} strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">
              {item.school}
            </p>
            {item.degree || item.field_of_study ? (
              <p className="mt-0.5 truncate text-[15px] text-zinc-400">
                {[item.degree, item.field_of_study].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            {item.start_year || item.end_year ? (
              <p className="mt-1 text-xs text-zinc-600">
                {item.start_year ?? "—"} — {item.end_year ?? "Present"}
              </p>
            ) : null}
          </div>
          {onEdit || onDelete ? (
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {onEdit ? (
                <IconAction label="Edit education" onClick={() => onEdit(item)}>
                  <Pencil size={13} />
                </IconAction>
              ) : null}
              {onDelete ? (
                <IconAction
                  label="Delete education"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 size={13} />
                </IconAction>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function SkillsList({
  skills,
  onRemove,
}: {
  skills: Skill[];
  onRemove?: (id: string) => void;
}) {
  if (skills.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-zinc-500">
        No skills added yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill.id}
          className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-[15px] text-zinc-200 transition-colors hover:border-zinc-600"
        >
          {skill.name}
          {onRemove ? (
            <button
              type="button"
              aria-label={`Remove ${skill.name}`}
              onClick={() => onRemove(skill.id)}
              className="rounded-full text-zinc-500 transition-colors hover:text-zinc-100"
            >
              <X size={12} strokeWidth={2} />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
