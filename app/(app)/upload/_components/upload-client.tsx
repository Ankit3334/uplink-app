"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Film, ImagePlus, Loader2 } from "lucide-react";
import {
  transmitPost,
  uploadReel,
  type TransmitPostState,
  type UploadReelState,
} from "@/app/actions/posts";

const initialPostState: TransmitPostState = {};
const initialReelState: UploadReelState = {};

type Mode = "post" | "reel";

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  const label =
    mode === "reel" ? "INITIATE REEL TRANSMISSION" : "INITIATE TRANSMISSION";
  const pendingLabel = mode === "reel" ? "Transmitting Reel..." : "Transmitting...";
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden border border-zinc-700 bg-[#111111] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] transition-colors hover:border-zinc-600 hover:bg-[#161616] focus-visible:border-[#22d3ee] focus-visible:outline-none active:border-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin text-[#22d3ee]" />
          <span className="text-zinc-200">{pendingLabel}</span>
        </>
      ) : (
        <span className="text-[#22d3ee]">{label}</span>
      )}
    </button>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="grid grid-cols-2 border border-zinc-800 bg-[#0a0a0a]">
      {(["post", "reel"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={
              active
                ? "border-b-2 border-[#22d3ee] bg-[#111111] px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]"
                : "border-b-2 border-transparent px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-200"
            }
          >
            {m === "post" ? "[ POST ]" : "[ REEL ]"}
          </button>
        );
      })}
    </div>
  );
}

function PostUploadForm() {
  const [state, formAction] = useActionState(transmitPost, initialPostState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
      handleFileChange(file);
    }
  }

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="mb-4 border-b border-zinc-800 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          System Transmission // Image Payload
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Select image asset and attach data payload for uplink.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Image_Payload
          </p>
          <label
            htmlFor="image"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative flex min-h-60 w-full cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-zinc-700 bg-[#111111] p-4 text-center transition-colors hover:border-zinc-600 hover:bg-[#151515]"
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected transmission preview"
                  className="max-h-72 w-full border border-zinc-800 object-contain"
                />
                <span className="mt-3 block w-full truncate font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
                  Loaded: {fileName}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  Click or drop to replace
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-zinc-400">
                <ImagePlus
                  size={32}
                  strokeWidth={1.6}
                  className="text-zinc-500 transition-colors duration-200 ease-in-out group-hover:text-zinc-300"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                    Drop Image Signal
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    or click to select payload
                  </p>
                </div>
                <p className="font-mono text-[10px] text-zinc-600">
                  ACCEPTED: image/* // target bucket: uplink-posts
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Caption/Data Payload
          </span>
          <textarea
            name="caption"
            rows={4}
            placeholder="ENTER TRANSMISSION TEXT..."
            className="w-full resize-y border border-zinc-800 bg-[#111111] px-3 py-2.5 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
          />
        </label>

        {state?.error ? (
          <div
            role="alert"
            className="border border-zinc-700 bg-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300"
          >
            {state.error}
          </div>
        ) : null}

        <SubmitButton mode="post" />
      </form>
    </div>
  );
}

function ReelUploadForm() {
  const [state, formAction] = useActionState(uploadReel, initialReelState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("video/")) {
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
      handleFileChange(file);
    }
  }

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="mb-4 border-b border-zinc-800 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          System Transmission // Video Reel Payload
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Select video asset for reel broadcast. Vertical short-form recommended.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Video_Payload
          </p>
          <label
            htmlFor="video"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative flex min-h-60 w-full cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-zinc-700 bg-[#111111] p-4 text-center transition-colors hover:border-zinc-600 hover:bg-[#151515]"
          >
            {previewUrl ? (
              <>
                <video
                  src={previewUrl}
                  className="max-h-72 w-full border border-zinc-800 bg-black object-contain"
                  muted
                  playsInline
                  loop
                  autoPlay
                />
                <span className="mt-3 block w-full truncate font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
                  Loaded: {fileName}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  Click or drop to replace
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-zinc-400">
                <Film
                  size={32}
                  strokeWidth={1.6}
                  className="text-zinc-500 transition-colors duration-200 ease-in-out group-hover:text-zinc-300"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                    Drop Video Signal
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    or click to select payload
                  </p>
                </div>
                <p className="font-mono text-[10px] text-zinc-600">
                  ACCEPTED: video/* // target bucket: reel-videos
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="video"
              name="video"
              type="file"
              accept="video/*"
              required
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Caption/Data Payload
          </span>
          <textarea
            name="caption"
            rows={4}
            placeholder="ENTER REEL TRANSMISSION TEXT..."
            className="w-full resize-y border border-zinc-800 bg-[#111111] px-3 py-2.5 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
          />
        </label>

        {state?.error ? (
          <div
            role="alert"
            className="border border-zinc-700 bg-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300"
          >
            {state.error}
          </div>
        ) : null}

        <SubmitButton mode="reel" />
      </form>
    </div>
  );
}

export function UploadClient() {
  const [mode, setMode] = useState<Mode>("post");

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      {mode === "post" ? <PostUploadForm /> : <ReelUploadForm />}
    </div>
  );
}
