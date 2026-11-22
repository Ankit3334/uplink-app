export default function Loading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-2xl flex-col gap-5 px-4 pt-6 pb-24 animate-fade-in">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-2 w-32 animate-pulse rounded-md bg-zinc-900" />
          <div className="mt-2 h-7 w-44 animate-pulse rounded-md bg-zinc-900" />
          <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-900" />
      </header>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-start gap-5">
          <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-40 animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-56 animate-pulse rounded-md bg-zinc-900" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded-md bg-zinc-900" />
            <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-900" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="h-2 w-20 animate-pulse rounded-md bg-zinc-900" />
            <div className="mt-3 h-7 w-12 animate-pulse rounded-md bg-zinc-900" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="h-3 w-32 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-zinc-900" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded-md bg-zinc-900" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-900" />
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
