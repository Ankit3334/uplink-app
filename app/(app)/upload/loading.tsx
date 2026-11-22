export default function UploadLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <header className="border-b border-zinc-800 pb-4">
        <div className="h-2 w-24 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-6 w-28 animate-pulse rounded-md bg-zinc-900" />
        <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded-md bg-zinc-900" />
      </header>

      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
          />
        ))}
      </div>

      <div className="h-6 w-20 animate-pulse rounded-md bg-zinc-900" />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-zinc-900"
          />
        ))}
      </div>

      <div className="aspect-square w-full animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />

      <div className="h-32 w-full animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />

      <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900" />
    </section>
  );
}
