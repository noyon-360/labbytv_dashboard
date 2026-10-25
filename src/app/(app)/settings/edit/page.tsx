import type { Metadata } from "next";
import { EditPersonalInfoPage } from "@/features/settings/EditPersonalInfoPage";

export const metadata: Metadata = { title: "Edit Personal Information" };

export default function Page() {
  return <EditPersonalInfoPage />;
}
