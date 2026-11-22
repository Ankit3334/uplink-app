import { UploadClient } from "./_components/upload-client";

export default function UplinkPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="border border-zinc-800 bg-[#0a0a0a] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Channel // 03
        </p>
        <h1 className="mt-2 text-xl font-bold uppercase tracking-wider text-zinc-100">
          Uplink
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          System Transmission Console // Prepare payload for broadcast.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        <UploadClient />
      </div>
    </section>
  );
}
