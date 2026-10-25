"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActive } from "./nav";

const itemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-fg transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-brand";

export function SidebarNav({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex h-full flex-col px-3 pt-6 pb-5">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onNavigate={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(itemClass, active ? "bg-nav-active" : "hover:bg-white/5")}
              >
                <Icon className={cn("size-[18px] shrink-0", active ? "text-brand" : "text-fg")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={onLogout} className={cn(itemClass, "mt-auto hover:bg-white/5")}>
        <LogOut className="size-[18px] shrink-0" aria-hidden />
        Logout
      </button>
    </nav>
  );
}
