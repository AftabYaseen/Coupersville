"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveCompanySettings({
  companyId, company_name, business_type, service_type, color_scheme, logo_url,
}) {
  const { profile } = await requireAuth();
  if (profile.company_id !== companyId) return { error: "Unauthorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ company_name, business_type, service_type, color_scheme, logo_url })
    .eq("id", companyId);

  if (error) return { error: error.message };
  revalidatePath("/company-settings");
  return { ok: true };
}
