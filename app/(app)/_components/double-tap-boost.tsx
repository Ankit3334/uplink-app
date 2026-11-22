"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart } from "lucide-react";
import { toggleBoostPost } from "@/app/actions/posts";
import { triggerHaptic } from "@/src/lib/utils";

export function DoubleTapBoost({
  postId,
  onBoosted,
  onSingleTap,
  className,
  children,
}: {
  postId: string;
  onBoosted?: (boosted: boolean, boostCount: number) => void;
  onSingleTap?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const lastTap = useRef(0);
  const singleTapTimer = useRef<number | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (singleTapTimer.current) window.clearTimeout(singleTapTimer.current);
    };
  }, []);

  const trigger = async () => {
    triggerHaptic();
    setShowHeart(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShowHeart(false), 1000);

    const res = await toggleBoostPost(postId);
    if (!res.error) {
      onBoosted?.(res.boosted, res.boostCount);
      window.dispatchEvent(
        new CustomEvent("post:boosted", {
          detail: { postId, boosted: res.boosted, boostCount: res.boostCount },
        }),
      );
    }
  };

  const onClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      if (singleTapTimer.current) {
        window.clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      lastTap.current = 0;
      void trigger();
    } else {
      lastTap.current = now;
      if (onSingleTap) {
        singleTapTimer.current = window.setTimeout(() => {
          onSingleTap();
          lastTap.current = 0;
          singleTapTimer.current = null;
        }, 320);
      }
    }
  };

  return (
    <div className={`relative ${className ?? ""}`} onClick={onClick}>
      {children}
      {showHeart ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Heart
            size={72}
            className="text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] animate-heart-pop"
            fill="currentColor"
            strokeWidth={0}
          />
        </div>
      ) : null}
    </div>
  );
}
