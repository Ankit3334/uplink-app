"use client";

import { useEffect, type ReactNode } from "react";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 1. THE BLURRY BACKDROP (Sibling 1) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. THE SHARP CONTENT (Sibling 2 - MUST NOT BE INSIDE THE BACKDROP) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-50 w-full max-w-lg bg-zinc-950 text-white rounded-t-3xl sm:rounded-3xl border-t border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-10 bg-zinc-950 pt-3 pb-2 flex justify-center border-b border-zinc-900">
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
        </div>

        {/* Actual Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
