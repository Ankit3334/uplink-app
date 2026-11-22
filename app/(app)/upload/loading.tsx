export default function UploadLoading() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="h-2 w-24 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-6 w-28 animate-pulse rounded-none bg-zinc-800" />
        <div className="mt-3 h-3 w-full max-w-xs animate-pulse rounded-none bg-zinc-800" />
      </header>

      <div className="border-t border-zinc-800 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
        <div className="aspect-square animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
        <div className="h-24 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
        <div className="h-11 animate-pulse rounded-none border border-zinc-800 bg-zinc-900" />
      </div>
    </section>
  );
}
