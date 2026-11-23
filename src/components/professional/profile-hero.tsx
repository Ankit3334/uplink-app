"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BriefcaseBusiness, Check, MapPin } from "lucide-react";
import { setOpenToWork } from "@/app/actions/professional";
import { triggerHaptic } from "@/src/lib/utils";

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} avatar`}
        className="h-24 w-24 rounded-full border-4 border-zinc-950 object-cover shadow-xl"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-zinc-950 bg-zinc-800 text-2xl font-semibold text-zinc-300 shadow-xl">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function ProfileHero({
  name,
  username,
  avatarUrl,
  headline,
  location,
  openToWork,
  connectionsCount,
  isSelf,
  action,
}: {
  name: string;
  username: string;
  avatarUrl: string | null;
  headline: string;
  location: string | null;
  openToWork: boolean;
  connectionsCount: number;
  isSelf: boolean;
  action?: ReactNode;
}) {
  const [isOpenToWork, setIsOpenToWork] = useState(openToWork);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleOpenToWork = () => {
    triggerHaptic();
    const next = !isOpenToWork;
    setIsOpenToWork(next);
    setError(null);
    startTransition(async () => {
      const result = await setOpenToWork(next);
      if (result.error) {
        setIsOpenToWork(!next);
        setError(result.error);
      }
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
      <div className="h-24 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />

      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <Avatar src={avatarUrl} name={name} />
          {action ? <div className="pb-1">{action}</div> : null}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {name}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">@{username}</p>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium leading-relaxed text-zinc-200">
            <BriefcaseBusiness size={16} strokeWidth={1.8} className="text-zinc-500" />
            {headline}
          </p>
          {location ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <MapPin size={16} strokeWidth={1.8} className="text-zinc-500" />
              {location}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isSelf ? (
            <button
              type="button"
              onClick={toggleOpenToWork}
              aria-pressed={isOpenToWork}
              className={
                isOpenToWork
                  ? "inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-400/15 disabled:opacity-60"
                  : "inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/70 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-60"
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isOpenToWork ? "bg-cyan-400" : "bg-zinc-500"}`}
              />
              Open to Work
              {isOpenToWork ? <Check size={12} strokeWidth={2.2} /> : null}
            </button>
          ) : isOpenToWork ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Open to Work
            </span>
          ) : null}

          <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400">
            {connectionsCount} connection{connectionsCount === 1 ? "" : "s"}
          </span>
        </div>

        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </div>
    </section>
  );
}
