export default function ExploreLoading() {
  return (
    <section aria-busy="true" role="status" className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <span className="sr-only">Loading…</span>
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-24 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-6 w-32 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="h-10 w-full animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-900" />
          <div className="h-3 w-16 animate-pulse rounded-md bg-zinc-900" />
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
