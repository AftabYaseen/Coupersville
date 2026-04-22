"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upsertClient({ id, companyId, client_name, contact_person, email, phone, address, notes, status }) {
  const { profile } = await requireAuth();
  if (profile.company_id !== companyId) return { error: "Unauthorized." };

  const supabase = await createClient();
  const payload  = { company_id: companyId, client_name: client_name.trim(), contact_person: contact_person || null, email: email || null, phone: phone || null, address: address || null, notes: notes || null, status };

  const { error } = id
    ? await supabase.from("clients").update(payload).eq("id", id)
    : await supabase.from("clients").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { ok: true };
}

export async function deleteClient(id) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();
  await supabase.from("clients").delete().eq("id", id).eq("company_id", profile.company_id);
  revalidatePath("/clients");
  return { ok: true };
}
