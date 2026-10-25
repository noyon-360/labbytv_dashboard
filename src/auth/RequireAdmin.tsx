"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas" role="status" aria-label="Loading">
      <LoaderCircle className="size-8 animate-spin text-brand" />
    </div>
  );
}

/** Renders children only for a signed-in admin; everyone else goes to /login. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, expired, retry } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const params = new URLSearchParams();
    const here = window.location.pathname + window.location.search;
    if (here !== "/dashboard") params.set("next", here);
    if (expired) params.set("expired", "1");
    const qs = params.toString();
    router.replace(`/login${qs ? `?${qs}` : ""}`);
  }, [status, expired, router]);

  if (status === "authenticated") return <>{children}</>;
  if (status === "offline") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/10">
          <WifiOff className="size-6" />
        </span>
        <p className="text-xl font-medium">Couldn&apos;t reach the server</p>
        <p className="max-w-sm text-fg-2">Check your connection, then try again.</p>
        <Button size="sm" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }
  return <FullScreenLoader />;
}
