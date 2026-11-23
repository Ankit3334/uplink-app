export default function Loading() {
  return (
    <section aria-busy="true" role="status" className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-5 px-4 pb-8 pt-10 animate-fade-in">
      <span className="sr-only">Loading…</span>
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-28 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-8 w-44 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-start gap-5">
          <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-40 animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-full animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="h-2 w-20 animate-pulse rounded-md bg-zinc-900" />
            <div className="mt-3 h-6 w-12 animate-pulse rounded-md bg-zinc-900" />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="h-4 w-32 animate-pulse rounded-md bg-zinc-900" />
          <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse border border-zinc-800 bg-zinc-900"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
