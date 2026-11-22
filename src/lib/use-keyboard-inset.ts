"use client";

import { useEffect, useState } from "react";

/**
 * Tracks how much of the viewport the mobile keyboard is covering.
 *
 * `visualViewport` is the reliable signal on both iOS Safari and Android
 * Chrome. The value is also published as `--keyboard-inset` so fixed
 * composers can be lifted above the keyboard with plain CSS.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const update = () => {
      const next = Math.max(
        0,
        Math.round(
          window.innerHeight - visualViewport.height - visualViewport.offsetTop,
        ),
      );
      setInset(next);
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${next}px`,
      );
    };

    update();
    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      visualViewport.removeEventListener("resize", update);
      visualViewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return inset;
}
