"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthProvider";
import { FullScreenLoader } from "@/auth/RequireAdmin";
import { ResetFlowProvider } from "./ResetFlow";

/** Only allow same-site paths as a post-login destination. */
export function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") return <FullScreenLoader />;

  return (
    <ResetFlowProvider>
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10">
        <Image src="/labby-logo.png" alt="LABBY TV" width={56} height={56} priority className="mb-6 rounded-2xl" />
        <div className="w-full max-w-[440px] rounded-xl bg-surface px-6 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </ResetFlowProvider>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
