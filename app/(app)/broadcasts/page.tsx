export default function BroadcastsPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // 02
        </p>
        <h1 className="mt-2 text-xl font-bold uppercase tracking-wider text-zinc-100">
          Broadcasts
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Ephemeral signal bursts. Placeholder channel.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-5 text-sm text-zinc-400">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
            No Active Broadcasts
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Broadcast relay offline. This route is reserved for future signal
            drops.
          </p>
        </div>
      </div>
    </section>
  );
}
