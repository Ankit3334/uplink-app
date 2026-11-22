import { cn, stripCodeFences } from "@/src/lib/utils";

/**
 * Lightweight code snippet renderer. Syntax highlighting can be layered in
 * later; the feed only needs a clean, monospace, dark surface for now.
 */
export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string | null;
  className?: string;
}) {
  const source = stripCodeFences(code);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Code
        </span>
        {language ? (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            {language}
          </span>
        ) : null}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-zinc-200">
        <code>{source}</code>
      </pre>
    </div>
  );
}
