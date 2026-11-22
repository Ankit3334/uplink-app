export default function BroadcastsLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="h-2 w-24 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-6 w-40 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-3 w-full max-w-xs animate-pulse rounded-none bg-zinc-800" />
      </header>

      <div className="border-t border-zinc-800 pt-4">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-5 space-y-3">
          <div className="h-2 w-36 animate-pulse rounded-none bg-zinc-800" />
          <div className="h-3 w-full animate-pulse rounded-none bg-zinc-800" />
          <div className="h-3 w-4/5 animate-pulse rounded-none bg-zinc-800" />
        </div>
      </div>
    </section>
  );
}
