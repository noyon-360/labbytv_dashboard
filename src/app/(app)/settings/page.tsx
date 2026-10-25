import type { Metadata } from "next";
import { PersonalInfoPage } from "@/features/settings/PersonalInfoPage";

export const metadata: Metadata = { title: "Personal Information" };

export default function Page() {
  return <PersonalInfoPage />;
}
