"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { triggerHaptic } from "@/src/lib/utils";

const initialState: UpdateProfileState = {};

function SaveConfigButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        "Save changes"
      )}
    </button>
  );
}

export function ProfileEditor({
  initialDisplayName,
  initialBio,
  initialLocation,
  initialOpenToWork,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialLocation: string;
  initialOpenToWork: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [ackSuccess, setAckSuccess] = useState<number | null>(null);

  // Render-time state adjustment closes the sheet after a successful save.
  if (
    state?.success != null &&
    state.success !== ackSuccess
  ) {
    setAckSuccess(state.success);
    setIsOpen(false);
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">Edit profile</p>
          <p className="mt-1 text-[15px] leading-relaxed text-zinc-500">
            Update the name, location, and about text on your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setIsOpen(true);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Edit details
        </button>
      </div>

      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit profile"
      >
        <form action={formAction} className="space-y-4 p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Name
            </span>
            <input
              type="text"
              name="display_name"
              required
              defaultValue={initialDisplayName}
              maxLength={64}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Location
            </span>
            <input
              type="text"
              name="location"
              defaultValue={initialLocation}
              maxLength={120}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
              placeholder="San Francisco, CA"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              About
            </span>
            <textarea
              name="bio"
              rows={4}
              defaultValue={initialBio}
              maxLength={280}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-[15px] leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
              placeholder="A short introduction..."
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3">
            <span>
              <span className="block text-sm font-medium text-zinc-200">
                Show &ldquo;Open to Work&rdquo; badge
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                Appears beside your name on your profile and in the feed.
              </span>
            </span>
            <input
              type="checkbox"
              name="open_to_work"
              defaultChecked={initialOpenToWork}
              className="h-4 w-4 flex-shrink-0 rounded border-zinc-700 bg-zinc-900 accent-cyan-400"
            />
          </label>

          {state?.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {state.error}
            </p>
          ) : null}

          {state?.success ? (
            <p role="status" className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
              Profile updated.
            </p>
          ) : null}

          <SaveConfigButton />
        </form>
      </BottomSheet>
    </div>
  );
}
