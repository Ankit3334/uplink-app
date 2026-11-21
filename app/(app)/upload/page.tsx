import { UploadClient } from "./_components/upload-client";

export default function UplinkPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-10">
      <header className="border border-neon-cyan/40 bg-[#0a0a0a] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          Channel // 03
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight glow-cyan">
          Uplink
        </h1>
        <p className="mt-2 text-xs text-[#a0a0a0]">
          System Transmission Console // Prepare payload for broadcast.
        </p>
      </header>

      <UploadClient />
    </section>
  );
}
