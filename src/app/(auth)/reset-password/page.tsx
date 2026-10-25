import type { Metadata } from "next";
import { UpdatePasswordPage } from "@/features/auth/UpdatePasswordPage";

export const metadata: Metadata = { title: "Update Password" };

export default function Page() {
  return <UpdatePasswordPage />;
}
