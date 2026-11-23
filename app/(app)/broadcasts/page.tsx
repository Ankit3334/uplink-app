export default function BroadcastsPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-zinc-950 p-4">
        <p className="eyebrow">
          Channel // 02
        </p>
        <h1 className="page-title">
          Broadcasts
        </h1>
        <p className="page-subtitle">
          Ephemeral signal bursts. Placeholder channel.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        <div className="u-panel u-empty py-10">
          <p className="u-empty-title">No active broadcasts</p>
          <p className="u-empty-copy">
            Broadcast relay offline. This route is reserved for future signal
            drops.
          </p>
        </div>
      </div>
    </section>
  );
}
