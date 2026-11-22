"use client";

import { useState } from "react";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { DoubleTapBoost } from "./double-tap-boost";

/**
 * Feed/detail image with native-style interactions: double-tap boosts the
 * post, single tap opens the image in a bottom sheet instead of a centered
 * lightbox.
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

  return (
    <>
      <DoubleTapBoost postId={postId} onSingleTap={() => setPreviewOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} loading="lazy" />
      </DoubleTapBoost>

      <BottomSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Image preview"
        maxHeightClassName="max-h-[90dvh]"
      >
        <div className="bg-black p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="mx-auto max-h-[76dvh] w-auto object-contain" />
        </div>
      </BottomSheet>
    </>
  );
}
