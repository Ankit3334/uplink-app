"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Heart, LayoutGrid, User } from "lucide-react";
import { cn, triggerHaptic } from "@/src/lib/utils";

const navItems = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/notifications", label: "Alerts", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-black/80 backdrop-blur-xl"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4 items-stretch px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                    "relative flex h-12 w-full max-w-[76px] flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 ease-out",
                    isActive
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {showBadge ? (
                    <span className="absolute -right-1 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-zinc-950 bg-cyan-500 px-0.5 font-mono text-[8px] font-bold leading-none text-zinc-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                  <span className="text-[9px] uppercase leading-none tracking-[0.12em] sm:text-[10px] sm:tracking-[0.16em]">
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
