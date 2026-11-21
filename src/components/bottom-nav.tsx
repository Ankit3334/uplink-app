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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neon-cyan/30 bg-[#0a0a0a]"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4 items-stretch">
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
                  "flex h-full flex-col items-center justify-center gap-1 border-2 border-transparent text-[10px] uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "text-[#00f3ff]"
                    : "text-[#8a8a8a] hover:text-[#e0e0e0]",
                  isProminent && "mx-2 my-1 border-[#00f3ff] bg-[#050505]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={cn(
                    isActive && "drop-shadow-[0_0_6px_rgba(0,243,255,0.8)]",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
