"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upsertCode({ id, companyId, code_label, code_value, client_id, notes, expires_at, is_active }) {
  const { profile } = await requireAuth();
  if (profile.company_id !== companyId) return { error: "Unauthorized." };

  const supabase    = await createServiceClient();
  const passphrase  = process.env.SECURITY_CODE_SECRET || "dev_secret_change_me";

  if (id) {
    const { error } = await supabase.rpc("update_security_code", {
      p_id:         id,
      p_company_id: companyId,
      p_label:      code_label.trim(),
      p_value:      code_value.trim(),
      p_client_id:  client_id || null,
      p_notes:      notes || null,
      p_expires_at: expires_at || null,
      p_is_active:  is_active,
      p_passphrase: passphrase,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.rpc("insert_security_code", {
      p_company_id: companyId,
      p_label:      code_label.trim(),
      p_value:      code_value.trim(),
      p_client_id:  client_id || null,
      p_notes:      notes || null,
      p_expires_at: expires_at || null,
      p_passphrase: passphrase,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/security-codes");
  return { ok: true };
}

export async function deleteCode(id) {
  const { profile } = await requireAuth();
  const supabase    = await createServiceClient();
  await supabase.from("security_codes").delete().eq("id", id).eq("company_id", profile.company_id);
  revalidatePath("/security-codes");
  return { ok: true };
}
