import "@/app/app.css";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import AppShell from "@/components/shell/AppShell";

export default async function SuperAdminLayout({ children }) {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  return <AppShell profile={profile}>{children}</AppShell>;
}
