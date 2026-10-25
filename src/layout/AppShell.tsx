"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SidebarNav } from "./Sidebar";
import { ProfileMenu } from "./ProfileMenu";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the mobile drawer on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const askLogout = () => {
    setDrawerOpen(false);
    setConfirmLogout(true);
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-chrome pr-4 pl-4 sm:pr-5 lg:pl-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-fg hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu className="size-6" />
          </button>
          <Link href="/dashboard" aria-label="LABBY TV dashboard" className="rounded focus-visible:outline-2 focus-visible:outline-brand">
            <Image src="/labby-logo.png" alt="LABBY TV" width={34} height={34} priority className="rounded-lg" />
          </Link>
        </div>
        <ProfileMenu onLogout={askLogout} />
      </header>

      <aside className="fixed top-16 bottom-0 left-0 z-20 hidden w-[220px] border-r border-line bg-chrome lg:block">
        <SidebarNav onLogout={askLogout} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-line bg-chrome" aria-label="Menu">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Image src="/labby-logo.png" alt="LABBY TV" width={34} height={34} className="rounded-lg" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-fg hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="size-6" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <SidebarNav onNavigate={() => setDrawerOpen(false)} onLogout={askLogout} />
            </div>
          </aside>
        </div>
      )}

      <main className="px-4 pt-[88px] pb-10 sm:px-8 sm:pt-[96px] lg:ml-[220px]">
        <div className="mx-auto max-w-[1142px] 2xl:max-w-[1400px]">{children}</div>
      </main>

      <Modal open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Sign out?" className="max-w-[440px]">
        <p className="text-base text-fg-2">You&apos;ll need to sign in again to use the dashboard.</p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setConfirmLogout(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await logout();
              setSigningOut(false);
              setConfirmLogout(false);
            }}
          >
            Sign Out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
