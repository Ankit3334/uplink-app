export default function ReelsLoading() {
  return (
    <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#050505] animate-fade-in">
      <div className="absolute inset-0 animate-pulse bg-zinc-900/40" />
      <div className="absolute bottom-20 left-4 right-20 space-y-3">
        <div className="h-3 w-28 rounded-none bg-zinc-800" />
        <div className="h-3 w-full max-w-xs rounded-none bg-zinc-800" />
        <div className="h-3 w-2/3 max-w-[200px] rounded-none bg-zinc-800" />
      </div>
      <div className="absolute bottom-24 right-4 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-10 rounded-none bg-zinc-800" />
        ))}
      </div>
    </section>
  );
}
