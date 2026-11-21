"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { transmitPost, type TransmitPostState } from "@/app/actions/posts";

const initialState: TransmitPostState = {};

export function UploadClient() {
  const [state, formAction, pending] = useActionState(
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
    <div className="border border-neon-cyan/30 bg-[#0a0a0a] p-4">
      <div className="mb-4 border-b border-neon-cyan/20 pb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a8a8a]">
          System Transmission // Payload Assembly
        </p>
        <p className="mt-1 text-xs text-[#6a6a6a]">
          Select image asset and attach data payload for uplink.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">
            &gt; Image_Payload
          </p>
          <label
            htmlFor="image"
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="group relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed border-neon-cyan bg-[#050505] p-3 text-center transition-colors hover:bg-[#00f3ff]/5"
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected transmission preview"
                  className="max-h-72 w-full border border-neon-cyan/30 object-contain"
                />
                <span className="mt-2 block w-full truncate text-[10px] uppercase tracking-[0.15em] text-[#39ff14]">
                  Loaded: {fileName}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-[#6a6a6a]">
                  Click or drop to replace
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-[#8a8a8a]">
                <ImagePlus
                  size={36}
                  className="text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#00f3ff]">
                    Drop Image Signal
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#666]">
                    or click to select payload
                  </p>
                </div>
                <p className="text-[10px] text-[#444]">
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
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#39ff14]">
            &gt; Caption/Data Payload
          </span>
          <textarea
            name="caption"
            rows={4}
            placeholder="ENTER TRANSMISSION TEXT..."
            className="w-full resize-y border border-neon-cyan/40 bg-[#050505] px-3 py-2 font-mono text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#00f3ff] focus:shadow-[0_0_8px_rgba(0,243,255,0.3)]"
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

        <button
          type="submit"
          disabled={pending}
          className="relative w-full overflow-hidden border-2 border-[#00f3ff] bg-[#00f3ff]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#00f3ff] transition-colors hover:bg-[#00f3ff]/20 hover:shadow-[0_0_12px_rgba(0,243,255,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center justify-center gap-2">
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="animate-pulse">Transmitting...</span>
              </>
            ) : (
              "INITIATE TRANSMISSION"
            )}
          </span>
          {pending ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,243,255,0.12)_0px,rgba(0,243,255,0.12)_1px,transparent_1px,transparent_4px)] opacity-40"
            />
          ) : null}
        </button>
      </form>
    </div>
  );
}
