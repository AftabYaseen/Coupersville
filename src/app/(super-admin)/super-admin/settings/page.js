import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import SystemSettingsClient from "./SystemSettingsClient";

export const metadata = { title: "System Settings | Super Admin" };

export default async function SystemSettingsPage() {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase = await createServiceClient();
  const { data: settings } = await supabase
    .from("system_settings")
    .select("key, value")
    .order("key");

  const settingsMap = Object.fromEntries(
    (settings || []).map((s) => [s.key, s.value])
  );

  return <SystemSettingsClient settings={settingsMap} />;
}
