export default function FeedLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col px-4 pt-6 pb-24 animate-fade-in">
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-24 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-7 w-44 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex w-14 flex-shrink-0 flex-col items-center gap-1.5">
              <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-900" />
              <div className="h-2 w-10 animate-pulse rounded-md bg-zinc-900" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {Array.from({ length: 2 }).map((_, i) => (
          <article
            key={i}
            className="flex flex-col gap-4 border-b border-zinc-800 py-4"
          >
            <div className="flex items-center gap-3 px-4">
              <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-zinc-900" />
              <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-900" />
              <div className="ml-auto h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded-md bg-zinc-900" />
            <div className="aspect-square w-full animate-pulse bg-zinc-900" />
            <div className="flex flex-col gap-2 px-4">
              <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-900" />
              <div className="h-4 w-full animate-pulse rounded-md bg-zinc-900" />
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-900" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-900" />
          </article>
        ))}
      </div>
    </section>
  );
}
