export default function BroadcastsPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-6 px-4 pb-8 pt-10">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // 02
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-zinc-100">
          Broadcasts
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Ephemeral signal bursts. Placeholder channel.
        </p>
      </header>

      <div className="border border-zinc-800 bg-[#0a0a0a] p-6 text-sm text-zinc-400">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-300">
          No Active Broadcasts
        </p>
        <p className="mt-3 leading-relaxed">
          Broadcast relay offline. This route is reserved for future signal
          drops.
        </p>
      </div>
    </section>
  );
}
