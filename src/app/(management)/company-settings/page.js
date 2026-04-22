import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import CompanySettingsClient from "./CompanySettingsClient";

export const metadata = { title: "Company Settings | FairGround" };

export default async function CompanySettingsPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single();

  return <CompanySettingsClient company={company} />;
}
