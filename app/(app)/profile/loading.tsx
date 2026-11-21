export default function Loading() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="h-2 w-24 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-6 w-44 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-2 h-3 w-full max-w-xs animate-pulse rounded-none bg-zinc-800" />
      </header>

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-none bg-zinc-800" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-28 animate-pulse rounded-none bg-zinc-800" />
              <div className="h-3 w-36 animate-pulse rounded-none bg-zinc-800" />
              <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
              <div className="h-3 w-2/3 animate-pulse rounded-none bg-zinc-800" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-zinc-800 bg-[#0a0a0a] p-3">
              <div className="h-2 w-16 animate-pulse rounded-none bg-zinc-800" />
              <div className="mt-2 h-5 w-10 animate-pulse rounded-none bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
          <div className="h-3 w-32 animate-pulse rounded-none bg-zinc-800" />
          <div className="mt-3 h-24 w-full animate-pulse rounded-none bg-zinc-800" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="h-3 w-32 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-2 w-20 animate-pulse rounded-none bg-zinc-800" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-none border border-zinc-800 bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
