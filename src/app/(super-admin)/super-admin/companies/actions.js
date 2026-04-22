"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function setCompanyStatus(companyId, status) {
  const { profile } = await requireAuth();
  if (profile.role !== "super_admin") return { error: "Unauthorized." };
  const supabase = await createServiceClient();
  await supabase.from("companies").update({ status }).eq("id", companyId);
  revalidatePath("/super-admin/companies");
  return { ok: true };
}
