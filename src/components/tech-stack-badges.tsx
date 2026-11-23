import { cn } from "@/src/lib/utils";

/** Compact technology pills shared by the feed, threads and public profiles. */
export function TechStackBadges({
  stack,
  compact = false,
  className,
}: {
  stack: string[] | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const items = (stack ?? []).filter(Boolean).slice(0, 12);
  if (items.length === 0) return null;

  const visible = compact ? items.slice(0, 4) : items;
  const overflow = items.length - visible.length;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((tech, index) => (
        <span
          key={`${tech}-${index}`}
          className={cn(
            "rounded-md border border-zinc-700/60 bg-zinc-800 text-zinc-300",
            compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
          )}
        >
          {tech}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="rounded-md border border-zinc-700/60 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
