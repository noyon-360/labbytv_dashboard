import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[620px] rounded-xl bg-surface px-6 py-16 text-center">
        <p className="text-[64px] leading-none font-semibold">404</p>
        <h1 className="mt-6 text-2xl font-medium">This page doesn&apos;t exist</h1>
        <p className="mt-3 text-base text-fg-2">The link may be broken, or the page was moved.</p>
        <ButtonLink href="/dashboard" className="mt-8" icon={<ArrowLeft className="size-5" />}>
          Back to Dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
