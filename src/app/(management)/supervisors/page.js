import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import GuardsClient from "../guards/GuardsClient";

export const metadata = { title: "Supervisors | FairGround" };

export default async function SupervisorsPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase = await createClient();
  const { data: supervisors } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at")
    .eq("company_id", profile.company_id)
    .eq("role", "supervisor")
    .order("full_name");

  return (
    <GuardsClient
      guards={supervisors || []}
      companyId={profile.company_id}
      canManage={true}
    />
  );
}
