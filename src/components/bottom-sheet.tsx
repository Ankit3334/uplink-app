"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxHeightClassName?: string;
};

export function BottomSheet({
  open,
  onClose,
  title = "Options",
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Portaling to body guarantees no ancestor with backdrop-filter, transform
  // or overflow can create a stacking context that blurs/clips the sheet.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 1. THE BLURRY BACKDROP (Sibling 1) */}
      <div
        className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. THE SHARP CONTENT (Sibling 2 - NEVER INSIDE THE BACKDROP) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-50 w-full max-w-lg rounded-t-3xl border-t border-zinc-800 bg-zinc-950 text-white shadow-2xl sm:rounded-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-10 flex justify-center border-b border-zinc-900 bg-zinc-950 pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-zinc-800" />
        </div>

        {/* Extra bottom padding keeps fields and Save clear of nav / keyboard. */}
        <div className="bg-zinc-950 p-6 pb-24">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
