import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
