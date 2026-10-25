import type { Metadata } from "next";
import { UserListPage } from "@/features/users/UserListPage";

export const metadata: Metadata = { title: "User Management" };

export default function Page() {
  return <UserListPage />;
}
