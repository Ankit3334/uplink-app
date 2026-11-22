"use client";

import { useEffect, useState } from "react";
import { DoubleTapBoost } from "./double-tap-boost";

/**
 * Feed/detail image with native-style interactions: double-tap boosts the
 * post, single tap opens a dedicated preview overlay. The backdrop and the
 * sharp content panel are siblings, so backdrop-blur can never bleed into the
 * image.
 */
export function PostImage({
  postId,
  src,
  alt,
  className = "w-full object-cover",
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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* 1. THE BLURRY BACKDROP (Sibling 1) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewOpen(false)}
          />

          {/* 2. THE SHARP CONTENT (Sibling 2 - MUST NOT BE INSIDE THE BACKDROP) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className="relative z-50 w-full max-w-lg bg-zinc-950 text-white rounded-t-3xl sm:rounded-3xl border-t border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="sticky top-0 z-10 bg-zinc-950 pt-3 pb-2 flex justify-center border-b border-zinc-900">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Actual Content */}
            <div className="p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="mx-auto max-h-[72vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
