import { RequireAdmin } from "@/auth/RequireAdmin";
import { AppShell } from "@/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AppShell>{children}</AppShell>
    </RequireAdmin>
  );
}
