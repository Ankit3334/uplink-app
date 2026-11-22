import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  Settings2,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/src/lib/auth";
import { SettingsSignOutButton } from "./_components/settings-sign-out-button";

function SettingsRow({
  icon: Icon,
  label,
  description,
  href,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  href?: string;
  badge?: string;
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-200">{label}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{description}</span>
      </span>
      {badge ? (
        <span className="flex-shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {badge}
        </span>
      ) : (
        <ChevronRight size={15} className="flex-shrink-0 text-zinc-600" />
      )}
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-4 transition-colors";

  if (href) {
    return (
      <Link href={href} className={`${className} hover:bg-zinc-900`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export default async function SettingsPage() {
  await requireUser();

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          <Settings2 size={13} strokeWidth={1.8} />
          Preferences
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
          Settings
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
          Manage your profile, privacy and saved activity.
        </p>
      </header>

      <div>
        <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
          Account
        </p>
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <SettingsRow
            icon={UserRound}
            label="Edit Profile"
            description="Name, bio, location and professional details"
            href="/profile"
          />
          <SettingsRow
            icon={ShieldCheck}
            label="Account & Privacy"
            description="Security and visibility controls"
            badge="Soon"
          />
          <SettingsRow
            icon={Bell}
            label="Notifications"
            description="Connection requests and network activity"
            href="/notifications"
          />
          <SettingsRow
            icon={Bookmark}
            label="Saved Posts"
            description="Bookmarked transmissions"
            href="/saved"
          />
          <SettingsRow
            icon={CircleHelp}
            label="Help & Support"
            description="Documentation and contact channels"
            badge="Soon"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
          Session
        </p>
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <form action={signOut}>
            <SettingsSignOutButton />
          </form>
        </div>
      </div>

      <p className="px-1 text-center text-xs text-zinc-600">
        UPLINK // built for people who build
      </p>
    </section>
  );
}
