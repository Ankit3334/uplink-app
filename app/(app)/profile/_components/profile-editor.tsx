"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";

const initialState: UpdateProfileState = {};

export function ProfileEditor({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );
  const [ackSuccess, setAckSuccess] = useState<number | null>(null);

  if (state?.success && state.success !== ackSuccess) {
    setAckSuccess(state.success);
    setIsOpen(false);
  }

  return (
    <div className="border border-neon-green/20 bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#777]">
            Node Profile Controls
          </p>
          <p className="mt-1 font-mono text-xs text-[#8a8a8a]">
            Modify operator display metadata and bio payload.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="border border-neon-green/40 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#39ff14] transition-colors hover:bg-[#39ff14]/10 hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]"
        >
          {isOpen ? "Close Config" : "Edit Node Config"}
        </button>
      </div>

      {isOpen ? (
        <form
          action={formAction}
          className="mt-4 space-y-4 border border-dashed border-neon-green/40 bg-[#050505] p-4"
        >
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">
              &gt; Display_Name
            </span>
            <input
              type="text"
              name="display_name"
              required
              defaultValue={initialDisplayName}
              maxLength={64}
              className="w-full border border-neon-green/40 bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#39ff14] focus:shadow-[0_0_8px_rgba(57,255,20,0.25)]"
              placeholder="OPERATOR ALIAS"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">
              &gt; Bio
            </span>
            <textarea
              name="bio"
              rows={4}
              defaultValue={initialBio}
              maxLength={280}
              className="w-full resize-y border border-neon-green/40 bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#39ff14] focus:shadow-[0_0_8px_rgba(57,255,20,0.25)]"
              placeholder="NODE BIO / SIGNAL DESCRIPTION..."
            />
          </label>

          {state?.error ? (
            <div
              role="alert"
              className="border border-[#ff00ff]/50 bg-[#ff00ff]/5 px-3 py-2 text-xs uppercase tracking-[0.1em] text-[#ff4dff]"
            >
              {state.error}
            </div>
          ) : null}

          {state?.success ? (
            <div className="border border-neon-green/50 bg-[#39ff14]/5 px-3 py-2 text-xs uppercase tracking-[0.1em] text-[#39ff14]">
              Configuration saved.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#39ff14] bg-[#39ff14]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#39ff14] transition-colors hover:bg-[#39ff14]/20 hover:shadow-[0_0_12px_rgba(57,255,20,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Configuration"
            )}
          </button>
        </form>
      ) : null}
    </div>
  );
}
