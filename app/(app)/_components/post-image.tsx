"use client";

import { useEffect, useState } from "react";
import { DoubleTapBoost } from "./double-tap-boost";

/**
 * Feed/detail image with native-style interactions: double-tap boosts the
 * post, single tap opens an image preview. The blurred backdrop and the sharp
 * image panel are siblings, and the panel paints its own solid background, so
 * backdrop-blur can never bleed into the preview.
 */
export function PostImage({
  postId,
  src,
  alt,
  className = "aspect-[4/3] w-full object-cover",
}: {
  postId: string;
  src: string;
  alt: string;
  className?: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!previewOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [previewOpen]);

  return (
    <>
      <DoubleTapBoost postId={postId} onSingleTap={() => setPreviewOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} loading="lazy" />
      </DoubleTapBoost>

      {previewOpen ? (
        <div className="isolate fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          {/* 1. THE BLURRY BACKDROP (Sibling 1) */}
          <div
            className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewOpen(false)}
            aria-hidden="true"
          />

          {/* 2. THE SHARP CONTENT (Sibling 2 - NOT INSIDE THE BACKDROP) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className="relative z-[70] w-full max-w-lg rounded-t-3xl border-t border-zinc-800 bg-zinc-950 text-white shadow-2xl sm:rounded-xl max-h-[85vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="sticky top-0 z-10 flex justify-center border-b border-zinc-900 bg-zinc-950 pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-zinc-800" />
            </div>

            {/* Actual Content: solid surface, never transparent */}
            <div className="bg-zinc-950 p-6">
              <div className="flex justify-center bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
