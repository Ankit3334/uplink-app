export default function BroadcastsPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-10">
      <header className="border border-neon-magenta/30 bg-[#0a0a0a] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          Channel // 02
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight glow-magenta">
          Broadcasts
        </h1>
        <p className="mt-2 text-xs text-[#a0a0a0]">
          Ephemeral signal bursts. Placeholder channel.
        </p>
      </header>

      <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 text-sm text-[#8a8a8a]">
        <p className="uppercase tracking-[0.15em] text-[#ff00ff]">
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
