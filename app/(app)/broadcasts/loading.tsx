export default function BroadcastsLoading() {
  return (
    <section aria-busy="true" role="status" className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <span className="sr-only">Loading…</span>
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-24 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-6 w-40 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="h-2 w-36 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-zinc-900" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-900" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-900" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded-md bg-zinc-900" />
          </div>
          <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-zinc-900" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
        </div>
      ))}
    </section>
  );
}
