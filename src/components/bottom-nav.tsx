"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutGrid, Search, Upload, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/upload", label: "Uplink", icon: Upload, prominent: true },
  { href: "/notifications", label: "Alerts", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#0a0a0a]"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-stretch px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProminent = "prominent" in item && item.prominent;
          const showBadge = item.href === "/notifications" && unreadCount > 0;

          return (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 border border-transparent px-1 text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] sm:tracking-[0.18em]",
                  isActive
                    ? "text-[#22d3ee]"
                    : "text-zinc-500 hover:text-zinc-200",
                  isProminent &&
                    "mx-0.5 my-1.5 border-zinc-700 bg-[#111111] text-zinc-200 hover:border-zinc-600 hover:text-[#22d3ee]",
                  isProminent && isActive && "border-[#22d3ee] text-[#22d3ee]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative inline-flex">
                  <Icon size={18} strokeWidth={1.8} />
                  {showBadge ? (
                    <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center border border-[#0a0a0a] bg-[#22d3ee] px-0.5 font-mono text-[8px] font-bold leading-none text-[#050505]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
