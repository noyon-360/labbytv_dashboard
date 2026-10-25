import type { Metadata } from "next";
import { AnnouncementFormPage } from "@/features/announcements/AnnouncementFormPage";

export const metadata: Metadata = { title: "Create Announcement" };

export default function Page() {
  return <AnnouncementFormPage />;
}
