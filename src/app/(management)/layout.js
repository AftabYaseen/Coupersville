import "@/app/app.css";
import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import AppShell from "@/components/shell/AppShell";

export default async function ManagementLayout({ children }) {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  return <AppShell profile={profile}>{children}</AppShell>;
}
