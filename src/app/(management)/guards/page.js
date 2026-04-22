import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import GuardsClient from "./GuardsClient";

export const metadata = { title: "Guards | FairGround" };

export default async function GuardsPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "supervisor");

  const supabase = await createClient();
  const { data: guards } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at, avatar_url")
    .eq("company_id", profile.company_id)
    .in("role", ["guard", "rover"])
    .order("full_name");

  const canManage = ["management", "super_admin"].includes(profile.role);

  return (
    <GuardsClient
      guards={guards || []}
      companyId={profile.company_id}
      canManage={canManage}
    />
  );
}
