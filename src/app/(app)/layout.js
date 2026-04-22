import "@/app/app.css";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/shell/AppShell";

export default async function AppLayout({ children }) {
  const { profile } = await requireAuth();

  return <AppShell profile={profile}>{children}</AppShell>;
}
