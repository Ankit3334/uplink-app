"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Pencil } from "lucide-react";
import {
  updateDeveloperProfile,
  type UpdateDeveloperProfileState,
} from "@/app/actions/profile";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { TechStackBadges } from "@/src/components/tech-stack-badges";
import { triggerHaptic } from "@/src/lib/utils";

const initialState: UpdateDeveloperProfileState = {};

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-300 transition-colors hover:text-zinc-50"
    >
      <Pencil size={11} strokeWidth={2} />
      Edit
    </button>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Saving...
        </>
      ) : (
        "Save developer profile"
      )}
    </button>
  );
}

export function DeveloperBento({
  currentlyBuilding,
  techStack,
}: {
  currentlyBuilding: string | null;
  techStack: string[] | null;
}) {
  const [open, setOpen] = useState(false);
  const [ack, setAck] = useState<number | null>(null);
  const [state, formAction] = useActionState(
    updateDeveloperProfile,
    initialState,
  );
  const stack = Array.isArray(techStack) ? techStack.filter(Boolean) : [];

  // Close the sheet once the save action succeeds.
  if (state?.success != null && state.success !== ack) {
    setAck(state.success);
    setOpen(false);
  }

  const openEditor = () => {
    triggerHaptic();
    setOpen(true);
  };

  return (
    <>
      <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Currently building
          </p>
          <EditButton onClick={openEditor} />
        </div>
        {currentlyBuilding ? (
          <p className="mt-3 flex items-start gap-2 text-[15px] leading-relaxed text-zinc-100">
            <span className="relative mt-1.5 flex h-2 w-2 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{currentlyBuilding}</span>
          </p>
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
            No active project set. Share what you are shipping.
          </p>
        )}
      </div>

      <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Tech stack
          </p>
          <EditButton onClick={openEditor} />
        </div>
        {stack.length > 0 ? (
          <TechStackBadges stack={stack} className="mt-3" />
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
            Add the tools you build with to help other builders find you.
          </p>
        )}
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Developer profile"
      >
        <form action={formAction} className="space-y-5 p-4">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              &gt; Currently building
            </span>
            <input
              type="text"
              name="currently_building"
              defaultValue={currentlyBuilding ?? ""}
              maxLength={160}
              placeholder="Real-time collaboration engine in Rust"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              &gt; Tech stack
            </span>
            <textarea
              name="tech_stack"
              rows={3}
              defaultValue={stack.join(", ")}
              placeholder="Next.js, Rust, AI, PostgreSQL"
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-500"
            />
            <span className="mt-2 block font-mono text-[10px] text-zinc-500">
              Comma separated. Up to 12 technologies.
            </span>
          </label>

          {state?.error ? (
            <div
              role="alert"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-xs text-red-400"
            >
              {state.error}
            </div>
          ) : null}

          <SaveButton />
        </form>
      </BottomSheet>
    </>
  );
}
