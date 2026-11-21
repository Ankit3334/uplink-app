export default function Loading() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-8 pt-10">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="h-2 w-28 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-8 w-44 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-none bg-zinc-800" />
      </header>

      <div className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-none bg-zinc-800" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-32 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-4 w-40 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded-none bg-zinc-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <div className="h-2 w-20 animate-pulse rounded-none bg-zinc-800" />
            <div className="mt-3 h-6 w-12 animate-pulse rounded-none bg-zinc-800" />
          </div>
        ))}
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
    </section>
  );
}
