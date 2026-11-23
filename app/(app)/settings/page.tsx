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
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        <span className="mt-0.5 block text-xs text-zinc-400">{description}</span>
      </span>
      {badge ? (
        <span className="flex-shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {badge}
        </span>
      ) : (
        <ChevronRight size={15} className="flex-shrink-0 text-zinc-500" />
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

  return (
    <div className={`${className} opacity-70`} aria-disabled="true">
      {inner}
    </div>
  );
}

export default async function SettingsPage() {
  await requireUser();

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col gap-4 px-4 pt-6 pb-24 animate-fade-in-up">
      <header className="u-panel p-5">
        <p className="eyebrow flex items-center gap-2">
          <Settings2 size={13} strokeWidth={1.8} />
          Preferences
        </p>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage your profile, privacy and saved activity.
        </p>
      </header>

      <div>
        <p className="eyebrow mb-2 px-1">Account</p>
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
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
        <p className="eyebrow mb-2 px-1">Session</p>
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <form action={signOut}>
            <SettingsSignOutButton />
          </form>
        </div>
      </div>

      <p className="px-1 text-center text-xs text-zinc-500">
        UPLINK // built for people who build
      </p>
    </section>
  );
}
