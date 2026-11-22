export default function MessageRoomLoading() {
  return (
    <section className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-md flex-col px-4 pt-4 animate-fade-in">
      <header className="mb-3 border border-zinc-800 bg-[#0a0a0a] p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-16 animate-pulse rounded-none bg-zinc-800" />
          <div className="h-9 w-9 animate-pulse rounded-none bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 animate-pulse rounded-none bg-zinc-800" />
            <div className="h-2 w-20 animate-pulse rounded-none bg-zinc-800" />
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 border border-zinc-800 bg-[#0a0a0a] p-3">
        <div className="flex h-full flex-col gap-3">
          <div className="h-12 w-3/4 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          <div className="ml-auto h-12 w-2/3 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          <div className="h-12 w-2/3 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          <div className="ml-auto h-12 w-1/2 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          <div className="mt-auto h-10 w-full animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
        </div>
      </div>
    </section>
  );
}
