"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Radio, Upload, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/broadcasts", label: "Broadcasts", icon: Radio },
  { href: "/upload", label: "Uplink", icon: Upload, prominent: true },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#0a0a0a]"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4 items-stretch px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProminent = "prominent" in item && item.prominent;

          return (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1.5 border border-transparent text-[10px] uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "text-[#22d3ee]"
                    : "text-zinc-500 hover:text-zinc-200",
                  isProminent &&
                    "mx-1 my-1.5 border-zinc-700 bg-[#111111] text-zinc-200 hover:border-[#22d3ee] hover:text-[#22d3ee]",
                  isProminent && isActive && "border-[#22d3ee] text-[#22d3ee]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
