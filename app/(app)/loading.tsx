export default function FeedLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col px-4 pt-6 pb-24 animate-fade-in">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="h-2 w-24 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-6 w-44 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-3 w-full max-w-xs animate-pulse rounded-none bg-zinc-800" />
      </header>

      <div className="mt-4 border-t border-zinc-800 pt-4 space-y-4">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-16 flex-shrink-0 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-zinc-800 bg-[#0a0a0a]">
            <div className="flex items-center gap-3 border-b border-zinc-800 p-3">
              <div className="h-9 w-9 animate-pulse rounded-none bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-none bg-zinc-800" />
                <div className="h-2 w-16 animate-pulse rounded-none bg-zinc-800" />
              </div>
            </div>
            <div className="aspect-square animate-pulse bg-zinc-900" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
              <div className="h-3 w-2/3 animate-pulse rounded-none bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
