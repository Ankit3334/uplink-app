import { cn, stripCodeFences } from "@/src/lib/utils";

/** Lightweight code snippet renderer with a compact, static header. */
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
        "my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        <span>Code</span>
        {language ? <span className="normal-case">{language}</span> : null}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-zinc-300">
        <code>{source}</code>
      </pre>
    </div>
  );
}
