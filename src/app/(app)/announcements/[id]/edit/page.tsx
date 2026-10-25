import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementFormPage } from "@/features/announcements/AnnouncementFormPage";

export const metadata: Metadata = { title: "Edit Announcement" };

export default function Page() {
  return (
    <Suspense>
      <AnnouncementFormPage />
    </Suspense>
  );
}
