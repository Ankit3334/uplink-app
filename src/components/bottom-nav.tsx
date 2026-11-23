"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, House, Plus, Search, User } from "lucide-react";
import { cn, triggerHaptic } from "@/src/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/upload", label: "Create", icon: Plus },
  { href: "/notifications", label: "Activity", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-stretch gap-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isCreate = item.href === "/upload";
          const showBadge = item.href === "/notifications" && unreadCount > 0;

          return (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                onClick={triggerHaptic}
                aria-current={isActive ? "page" : undefined}
                className="flex h-full items-center justify-center"
              >
                <span
                  className={cn(
                    "relative flex h-12 w-full max-w-[68px] flex-col items-center justify-center gap-1 rounded-lg transition-colors duration-200 ease-out",
                    isActive
                      ? isCreate
                        ? "bg-cyan-400 text-zinc-950"
                        : "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {showBadge ? (
                    <span className="absolute -right-1 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-zinc-950 bg-cyan-400 px-0.5 font-mono text-[8px] font-bold leading-none text-zinc-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                  <span className="text-[9px] uppercase leading-none tracking-[0.1em] sm:text-[10px] sm:tracking-[0.12em]">
                    {item.label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
