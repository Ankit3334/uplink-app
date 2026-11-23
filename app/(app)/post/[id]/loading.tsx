export default function Loading() {
  return (
    <section aria-busy="true" role="status" className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-48 pt-6 animate-fade-in">
      <span className="sr-only">Loading…</span>
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-900" />
        <div className="ml-auto h-3 w-28 animate-pulse rounded-md bg-zinc-900" />
      </div>

      <article className="flex flex-col gap-4 border-b border-zinc-800 py-4">
        <div className="flex items-center gap-3 px-4">
          <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-zinc-900" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded-md bg-zinc-900" />
        <div className="aspect-square w-full animate-pulse bg-zinc-900" />
        <div className="flex flex-col gap-2 px-4">
          <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
          <div className="h-4 w-full animate-pulse rounded-md bg-zinc-900" />
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-900" />
      </article>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
          <div className="h-3 w-8 animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-full animate-pulse rounded-md bg-zinc-900" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-zinc-900" />
                <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
