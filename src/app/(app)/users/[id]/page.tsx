import type { Metadata } from "next";
import { Suspense } from "react";
import { UserDetailPage } from "@/features/users/UserDetailPage";

export const metadata: Metadata = { title: "User Details" };

export default function Page() {
  return (
    <Suspense>
      <UserDetailPage />
    </Suspense>
  );
}
