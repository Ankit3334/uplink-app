"use client";

import { useEffect, useRef } from "react";

/**
 * Invisible sentinel that calls `onIntersect` when it enters the viewport.
 * The callback is held in a ref so updating it after an append does not
 * recreate the observer; toggling `disabled` does, which also makes the
 * observer re-check a sentinel that is still on screen.
 */
export function InfiniteScrollTrigger({
  onIntersect,
  disabled = false,
  rootMargin = "320px 0px",
}: {
  onIntersect: () => void;
  disabled?: boolean;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || disabled || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersectRef.current();
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, rootMargin]);

  return <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />;
}
