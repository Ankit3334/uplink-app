export default function Loading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-48 pt-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-8 w-20 animate-pulse rounded-none border border-zinc-800 bg-zinc-800" />
        <div className="h-2 w-36 animate-pulse rounded-none bg-zinc-800" />
      </div>

      <article className="border border-zinc-800 bg-[#0a0a0a]">
        <header className="flex items-center gap-3 border-b border-zinc-800 p-4">
          <div className="h-10 w-10 animate-pulse rounded-none bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-2 w-20 animate-pulse rounded-none bg-zinc-800" />
          </div>
        </header>
        <div className="p-4">
          <div className="aspect-square w-full animate-pulse rounded-none border border-zinc-800 bg-zinc-800" />
        </div>
        <div className="space-y-2 px-4 pb-4">
          <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
          <div className="h-3 w-4/5 animate-pulse rounded-none bg-zinc-800" />
        </div>
        <div className="flex gap-2 border-t border-zinc-800 p-4">
          <div className="h-9 w-24 animate-pulse rounded-none bg-zinc-800" />
          <div className="h-9 w-24 animate-pulse rounded-none bg-zinc-800" />
        </div>
      </article>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="h-3 w-24 animate-pulse rounded-none bg-zinc-800" />
          <div className="h-2 w-16 animate-pulse rounded-none bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-zinc-800 border-l-2 border-l-zinc-700 bg-[#0a0a0a] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-2 w-24 animate-pulse rounded-none bg-zinc-800" />
                <div className="h-2 w-16 animate-pulse rounded-none bg-zinc-800" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
                <div className="h-3 w-5/6 animate-pulse rounded-none bg-zinc-800" />
                {i % 2 === 0 ? (
                  <div className="h-3 w-2/3 animate-pulse rounded-none bg-zinc-800" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
