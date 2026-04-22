"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveSystemSettings({ platform_name, platform_logo, maintenance }) {
  const { profile } = await requireAuth();
  if (profile.role !== "super_admin") return { error: "Unauthorized." };

  const supabase = await createServiceClient();

  const upserts = [
    { key: "platform_name",  value: JSON.stringify(platform_name), updated_by: profile.id },
    { key: "platform_logo",  value: platform_logo ? JSON.stringify(platform_logo) : "null", updated_by: profile.id },
    { key: "maintenance",    value: JSON.stringify(maintenance), updated_by: profile.id },
  ];

  for (const row of upserts) {
    await supabase
      .from("system_settings")
      .upsert(row, { onConflict: "key" });
  }

  revalidatePath("/super-admin/settings");
  return { ok: true };
}
