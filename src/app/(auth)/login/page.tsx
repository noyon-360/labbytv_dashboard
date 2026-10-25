import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/features/auth/LoginPage";

export const metadata: Metadata = { title: "Login" };

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
