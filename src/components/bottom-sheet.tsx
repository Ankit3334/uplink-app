"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn, triggerHaptic } from "@/src/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxHeightClassName?: string;
};

/**
 * Native-feeling bottom sheet used for every modal on mobile.
 * Slides up from the bottom, uses a dark surface, sharp top corners, a drag
 * handle and a dimmed backdrop. Dragging the handle down dismisses it.
 */
export function BottomSheet({ open, ...props }: BottomSheetProps) {
  // Remount on every open so drag/animation state always starts fresh.
  if (!open) return null;
  return <BottomSheetInner open {...props} />;
}

function BottomSheetInner({
  open,
  onClose,
  title = "Options",
  children,
  className,
  maxHeightClassName = "max-h-[85dvh]",
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [animated, setAnimated] = useState(true);
  const startY = useRef<number | null>(null);

  useEffect(() => {
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
  }, [onClose]);

  const dismiss = () => {
    triggerHaptic();
    onClose();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startY.current = event.clientY;
    setAnimated(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, event.clientY - startY.current));
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    startY.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (dragY > 96) {
      dismiss();
      return;
    }
    setDragY(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open ? true : undefined}
      className="fixed inset-0 z-[100] flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={dismiss}
      />

      <div
        className={cn(
          "safe-area-bottom relative w-full max-w-md overflow-y-auto overscroll-contain border border-zinc-800 border-b-0 bg-[#0a0a0a] animate-slide-up",
          maxHeightClassName,
          className,
        )}
        style={{
          animation: animated ? undefined : "none",
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
        }}
      >
        <div
          aria-hidden="true"
          className="sticky top-0 z-10 flex touch-none justify-center bg-[#0a0a0a] pb-1 pt-2.5 select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <span className="h-1 w-10 cursor-grab bg-zinc-700 active:cursor-grabbing" />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {title}
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="border border-zinc-800 bg-[#111111] p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
