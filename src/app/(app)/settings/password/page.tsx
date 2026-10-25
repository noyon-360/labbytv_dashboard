import type { Metadata } from "next";
import { ChangePasswordPage } from "@/features/settings/ChangePasswordPage";

export const metadata: Metadata = { title: "Change Password" };

export default function Page() {
  return <ChangePasswordPage />;
}
