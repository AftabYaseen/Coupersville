"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function submitCheckIn({ type, location, notes, clientId, userId, companyId }) {
  const { profile } = await requireAuth();

  // Guard: can only submit for yourself
  if (profile.id !== userId) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("check_ins").insert({
    company_id:     companyId,
    user_id:        userId,
    client_id:      clientId || null,
    check_in_type:  type,
    location:       location || null,
    notes:          notes || null,
  });

  if (error) return { error: error.message };

  // If ending a shift or ending a break, close any open break rows
  if (type === "shift_end" || type === "break_end") {
    await supabase
      .from("breaks")
      .update({ ended_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("ended_at", null);
  }

  // If starting a break, create a break row
  if (type === "break_start") {
    const { data: checkIn } = await supabase
      .from("check_ins")
      .select("id")
      .eq("user_id", userId)
      .eq("check_in_type", "break_start")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    await supabase.from("breaks").insert({
      company_id:  companyId,
      user_id:     userId,
      check_in_id: checkIn?.id || null,
      started_at:  new Date().toISOString(),
    });
  }

  // Activity log
  await supabase.from("activity_logs").insert({
    company_id:  companyId,
    user_id:     userId,
    action:      `check_in.${type}`,
    entity_type: "check_in",
    details:     { type, has_location: !!location },
  });

  return { ok: true };
}
