"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";

const initialState: UpdateProfileState = {};

function SaveConfigButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#161616] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-[#22d3ee] transition-colors hover:border-zinc-600 hover:bg-[#1b1b1b] focus-visible:border-[#22d3ee] focus-visible:outline-none active:border-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-zinc-200">Saving...</span>
        </>
      ) : (
        "SAVE CONFIGURATION"
      )}
    </button>
  );
}

export function ProfileEditor({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [ackSuccess, setAckSuccess] = useState<number | null>(null);

  if (state?.success && state.success !== ackSuccess) {
    setAckSuccess(state.success);
    setIsOpen(false);
  }

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Node Profile Controls
          </p>
          <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-400">
            Modify operator display metadata and bio payload.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 focus-visible:border-[#22d3ee] focus-visible:text-[#22d3ee] focus-visible:outline-none"
        >
          {isOpen ? "Close Config" : "EDIT NODE CONFIG"}
        </button>
      </div>

      {isOpen ? (
        <form
          action={formAction}
          className="mt-5 space-y-5 border border-dashed border-zinc-700 bg-[#111111] p-4"
        >
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              &gt; Display_Name
            </span>
            <input
              type="text"
              name="display_name"
              required
              defaultValue={initialDisplayName}
              maxLength={64}
              className="w-full border border-zinc-800 bg-[#0a0a0a] px-3 py-3 font-mono text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
              placeholder="OPERATOR ALIAS"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              &gt; Bio
            </span>
            <textarea
              name="bio"
              rows={4}
              defaultValue={initialBio}
              maxLength={280}
              className="w-full resize-y border border-zinc-800 bg-[#0a0a0a] px-3 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
              placeholder="NODE BIO / SIGNAL DESCRIPTION..."
            />
          </label>

          {state?.error ? (
            <div
              role="alert"
              className="border border-zinc-700 bg-[#0a0a0a] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300"
            >
              {state.error}
            </div>
          ) : null}

          {state?.success ? (
            <div className="border border-zinc-700 bg-[#0a0a0a] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300">
              Configuration saved.
            </div>
          ) : null}

          <SaveConfigButton />
        </form>
      ) : null}
    </div>
  );
}
