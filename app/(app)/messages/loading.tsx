export default function MessagesLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-24 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-6 w-36 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="h-10 w-full animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />

      <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-zinc-800" : ""}`}
          >
            <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
              <div className="h-3 w-1/3 animate-pulse rounded-md bg-zinc-900" />
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-zinc-900" />
            </div>
            <div className="h-4 w-4 animate-pulse rounded-md bg-zinc-900" />
          </div>
        ))}
      </div>
    </section>
  );
}
