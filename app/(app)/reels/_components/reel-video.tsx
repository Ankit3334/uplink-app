"use client";

import { useEffect, useRef } from "react";

export function ReelVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      el.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      className="h-full w-full object-contain"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  );
}
