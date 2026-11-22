import { cn, stripCodeFences } from "@/src/lib/utils";

/**
 * Lightweight code snippet renderer. The label floats over the surface so the
 * code itself keeps a clean, uninterrupted monospace column.
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
        "relative my-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4",
        className,
      )}
    >
      <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-2 text-[10px] text-zinc-600 uppercase">
        <span>Code</span>
        {language ? (
          <span className="font-mono normal-case text-zinc-700">{language}</span>
        ) : null}
      </div>
      <pre className="overflow-x-auto pt-5 font-mono text-sm leading-relaxed text-zinc-300">
        <code>{source}</code>
      </pre>
    </div>
  );
}
