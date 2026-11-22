"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";
import { updateAvatar, type UpdateAvatarState } from "@/app/actions/profile";
import { triggerHaptic } from "@/src/lib/utils";

const initialState: UpdateAvatarState = {};

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={triggerHaptic}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#161616] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#22d3ee] transition-colors hover:border-zinc-600 hover:bg-[#1b1b1b] focus-visible:border-[#22d3ee] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span className="text-zinc-200">Uploading...</span>
        </>
      ) : (
        "UPLOAD"
      )}
    </button>
  );
}

function AvatarForm({
  state,
  formAction,
  currentAvatarUrl,
}: {
  state: UpdateAvatarState;
  formAction: (payload: FormData) => void;
  currentAvatarUrl: string | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const shown = previewUrl ?? currentAvatarUrl;

  return (
    <form action={formAction} className="flex-1 space-y-3">
      <input
        id="avatar"
        name="avatar"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }}
      />

      <div className="flex flex-wrap gap-2">
        <label
          htmlFor="avatar"
          className="inline-flex cursor-pointer items-center justify-center border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          {shown ? "CHANGE NODE ICON" : "UPLOAD AVATAR"}
        </label>
      </div>

      {previewUrl ? <UploadButton /> : null}

      {state?.error ? (
        <div
          role="alert"
          className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300"
        >
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300">
          Avatar updated.
        </div>
      ) : null}
    </form>
  );
}

export function AvatarUploader({
  initialAvatarUrl,
}: {
  initialAvatarUrl: string | null;
}) {
  const [state, formAction] = useActionState(updateAvatar, initialState);
  const currentAvatarUrl = state?.avatarUrl ?? initialAvatarUrl;

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Node Icon
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden border border-zinc-800 bg-[#111111] text-zinc-500">
          {currentAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAvatarUrl}
              alt="Node icon"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={28} strokeWidth={1.5} />
          )}
        </div>

        <AvatarForm
          key={state?.success ?? "init"}
          state={state}
          formAction={formAction}
          currentAvatarUrl={currentAvatarUrl}
        />
      </div>
    </div>
  );
}
