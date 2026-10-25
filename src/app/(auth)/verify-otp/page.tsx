import type { Metadata } from "next";
import { VerifyOtpPage } from "@/features/auth/VerifyOtpPage";

export const metadata: Metadata = { title: "Verify OTP" };

export default function Page() {
  return <VerifyOtpPage />;
}
