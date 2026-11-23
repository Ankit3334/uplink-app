"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useTransition,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import {
  addSkills,
  deleteEducation,
  deleteExperience,
  deleteSkill,
  upsertEducation,
  upsertExperience,
  type ProfessionalState,
} from "@/app/actions/professional";
import { BottomSheet } from "@/src/components/bottom-sheet";
import {
  EducationList,
  ExperienceList,
  SectionCard,
  SkillsList,
} from "@/src/components/professional/profile-sections";
import type { Education, Experience, Skill } from "@/src/lib/professional";
import { triggerHaptic } from "@/src/lib/utils";

const initialState: ProfessionalState = {};

const fieldClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400";

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/70 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
    >
      <Plus size={13} strokeWidth={2.2} />
      Add
    </button>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? "Saving..." : label}
    </button>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {message}
    </p>
  );
}

function ExperienceForm({
  item,
  onDone,
}: {
  item: Experience | null;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(upsertExperience, initialState);
  const [isCurrent, setIsCurrent] = useState(item?.is_current ?? false);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="space-y-4 p-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          Job title
        </span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={item?.title ?? ""}
          placeholder="Senior Software Engineer"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          Company
        </span>
        <input
          name="company"
          required
          maxLength={120}
          defaultValue={item?.company ?? ""}
          placeholder="Acme Labs"
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            Start date
          </span>
          <input
            name="start_date"
            type="date"
            defaultValue={item?.start_date ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            End date
          </span>
          <input
            name="end_date"
            type="date"
            disabled={isCurrent}
            defaultValue={item?.end_date ?? ""}
            className={`${fieldClass} disabled:opacity-40`}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="is_current"
          type="checkbox"
          checked={isCurrent}
          onChange={(event) => setIsCurrent(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-cyan-400"
        />
        I currently work here
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          Description
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={1000}
          defaultValue={item?.description ?? ""}
          placeholder="What did you build or own?"
          className={`${fieldClass} resize-y`}
        />
      </label>
      <FormError message={state.error} />
      <SaveButton label={item ? "Save experience" : "Add experience"} />
    </form>
  );
}

function EducationForm({
  item,
  onDone,
}: {
  item: Education | null;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(upsertEducation, initialState);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="space-y-4 p-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          School
        </span>
        <input
          name="school"
          required
          maxLength={160}
          defaultValue={item?.school ?? ""}
          placeholder="University of Technology"
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            Degree
          </span>
          <input
            name="degree"
            maxLength={120}
            defaultValue={item?.degree ?? ""}
            placeholder="B.Sc."
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            Field of study
          </span>
          <input
            name="field_of_study"
            maxLength={120}
            defaultValue={item?.field_of_study ?? ""}
            placeholder="Computer Science"
            className={fieldClass}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            Start year
          </span>
          <input
            name="start_year"
            inputMode="numeric"
            maxLength={4}
            defaultValue={item?.start_year ?? ""}
            placeholder="2018"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">
            End year
          </span>
          <input
            name="end_year"
            inputMode="numeric"
            maxLength={4}
            defaultValue={item?.end_year ?? ""}
            placeholder="2022"
            className={fieldClass}
          />
        </label>
      </div>
      <FormError message={state.error} />
      <SaveButton label={item ? "Save education" : "Add education"} />
    </form>
  );
}

function SkillForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(addSkills, initialState);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="space-y-4 p-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          Skills
        </span>
        <input
          name="name"
          required
          maxLength={500}
          placeholder="TypeScript, React, PostgreSQL"
          className={fieldClass}
        />
        <span className="mt-2 block text-xs text-zinc-500">
          Separate multiple skills with commas. Up to 10 at a time.
        </span>
      </label>
      <FormError message={state.error} />
      <SaveButton label="Add skills" />
    </form>
  );
}

type Sheet = "experience" | "education" | "skill" | null;

export function ProfessionalManager({
  experiences,
  education,
  skills,
}: {
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}) {
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  const closeSheet = useCallback(() => setSheet(null), []);

  const openExperience = (item: Experience | null) => {
    triggerHaptic();
    setEditingExperience(item);
    setSheet("experience");
  };

  const openEducation = (item: Education | null) => {
    triggerHaptic();
    setEditingEducation(item);
    setSheet("education");
  };

  const openSkill = () => {
    triggerHaptic();
    setSheet("skill");
  };

  const remove = (action: () => Promise<{ error?: string }>) => {
    triggerHaptic();
    setDeleteError(null);
    startDelete(async () => {
      const result = await action();
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {deleteError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {deleteError}
        </p>
      ) : null}

      <SectionCard
        title="Experience"
        description="Roles, projects, and positions you have held."
        action={<AddButton onClick={() => openExperience(null)} />}
      >
        <ExperienceList
          experiences={experiences}
          onEdit={openExperience}
          onDelete={(id) => remove(() => deleteExperience(id))}
        />
      </SectionCard>

      <SectionCard
        title="Education"
        description="Where you studied and what you focused on."
        action={<AddButton onClick={() => openEducation(null)} />}
      >
        <EducationList
          education={education}
          onEdit={openEducation}
          onDelete={(id) => remove(() => deleteEducation(id))}
        />
      </SectionCard>

      <SectionCard
        title="Skills"
        description="Tools and technologies you work with."
        action={<AddButton onClick={openSkill} />}
      >
        <SkillsList
          skills={skills}
          onRemove={(id) => remove(() => deleteSkill(id))}
        />
      </SectionCard>

      <BottomSheet
        open={sheet === "experience"}
        onClose={closeSheet}
        title={editingExperience ? "Edit experience" : "Add experience"}
      >
        <ExperienceForm item={editingExperience} onDone={closeSheet} />
      </BottomSheet>

      <BottomSheet
        open={sheet === "education"}
        onClose={closeSheet}
        title={editingEducation ? "Edit education" : "Add education"}
      >
        <EducationForm item={editingEducation} onDone={closeSheet} />
      </BottomSheet>

      <BottomSheet
        open={sheet === "skill"}
        onClose={closeSheet}
        title="Add skills"
      >
        <SkillForm onDone={closeSheet} />
      </BottomSheet>

      {deleting ? (
        <span className="sr-only" role="status">
          Updating profile...
        </span>
      ) : null}
    </div>
  );
}
