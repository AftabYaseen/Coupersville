"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSuggestionStatus(id, status) {
  const { profile } = await requireAuth();
  if (profile.role !== "super_admin") return { error: "Unauthorized." };
  const supabase = await createServiceClient();
  await supabase.from("suggestions").update({ status }).eq("id", id);
  revalidatePath("/super-admin/suggestions");
  return { ok: true };
}
