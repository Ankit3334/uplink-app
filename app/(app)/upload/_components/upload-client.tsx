"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";
import { transmitPost, type TransmitPostState } from "@/app/actions/posts";

const initialState: TransmitPostState = {};

function TransmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden border border-zinc-700 bg-[#111111] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] transition-colors hover:border-zinc-600 hover:bg-[#161616] focus-visible:border-[#22d3ee] focus-visible:outline-none active:border-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin text-[#22d3ee]" />
          <span className="text-zinc-200">Transmitting...</span>
        </>
      ) : (
        <span className="text-[#22d3ee]">INITIATE TRANSMISSION</span>
      )}
    </button>
  );
}

export function UploadClient() {
  const [state, formAction] = useActionState(
    transmitPost,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
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

  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="mb-5 border-b border-zinc-800 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          System Transmission // Payload Assembly
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Select image asset and attach data payload for uplink.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Image_Payload
          </p>
          <label
            htmlFor="image"
            onDrop={onDrop}
            onDragOver={onDragOver}
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
              onChange={onInputChange}
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
            className="w-full resize-y border border-zinc-800 bg-[#111111] px-3 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#22d3ee]"
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

        <TransmitButton />
      </form>
    </div>
  );
}
