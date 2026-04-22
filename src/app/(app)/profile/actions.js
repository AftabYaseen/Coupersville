"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile({ full_name, phone, avatar_url }) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, avatar_url })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

export async function updatePassword(newPassword) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { ok: true };
}
