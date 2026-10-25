"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut, UserRound } from "lucide-react";
import { useProfile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { displayName } from "@/lib/format";

const itemClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-base text-fg-2 hover:bg-white/5 hover:text-fg focus-visible:bg-white/5 focus-visible:outline-none";

export function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Next keeps hidden routes mounted (Activity); close the menu when hidden.
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="hidden h-3 w-20 sm:block" />
        <Skeleton className="size-10" />
      </div>
    );
  }

  const name = displayName(profile);
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="hidden flex-col items-end gap-0.5 leading-[1.2] sm:flex">
          <span className="text-sm font-medium text-fg">{name}</span>
          <span className="text-xs text-subtle">Admin</span>
        </span>
        <Avatar name={name} src={profile.avatar?.url} size={34} />
        <ChevronDown className={cn("size-4 text-fg transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-surface shadow-modal"
        >
          <div className="border-b border-line px-4 py-4">
            <p className="truncate text-base font-medium">{name}</p>
            <p className="truncate text-sm text-muted">{profile.email}</p>
          </div>
          <div className="py-1">
            <Link role="menuitem" href="/settings" onNavigate={close} className={itemClass}>
              <UserRound className="size-5" aria-hidden />
              Personal Information
            </Link>
            <Link role="menuitem" href="/settings/password" onNavigate={close} className={itemClass}>
              <KeyRound className="size-5" aria-hidden />
              Change Password
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                close();
                onLogout();
              }}
              className={cn(itemClass, "text-danger-fg hover:text-danger-fg")}
            >
              <LogOut className="size-5" aria-hidden />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
