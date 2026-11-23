import { UploadClient } from "./_components/upload-client";

export default function UplinkPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="eyebrow">
          Channel // 03
        </p>
        <h1 className="page-title">
          Uplink
        </h1>
        <p className="page-subtitle">
          System Transmission Console // Prepare payload for broadcast.
        </p>
      </header>

      <div className="border-t border-zinc-800 pt-4">
        <UploadClient />
      </div>
    </section>
  );
}
