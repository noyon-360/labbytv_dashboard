import type { Metadata } from "next";
import { AnnouncementListPage } from "@/features/announcements/AnnouncementListPage";

export const metadata: Metadata = { title: "Announcements" };

export default function Page() {
  return <AnnouncementListPage />;
}
