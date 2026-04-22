"use server";

import { createServiceClient, createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function inviteUser({ email, full_name, role, companyId }) {
  const { profile } = await requireAuth();
  if (!["management", "super_admin"].includes(profile.role)) return { error: "Unauthorized." };
  if (profile.company_id !== companyId && profile.role !== "super_admin") return { error: "Unauthorized." };

  const supabase   = await createServiceClient();

  // Store pending invitation so the trigger can pick it up on signup
  await supabase.from("pending_invitations").upsert({
    email:      email.trim().toLowerCase(),
    role,
    company_id: companyId,
    invited_by: profile.id,
  }, { onConflict: "email,company_id" });

  // Send the invite email via Supabase Auth admin API
  const { error } = await supabase.auth.admin.inviteUserByEmail(email.trim(), {
    data: { full_name: full_name.trim(), role, company_id: companyId },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`,
  });

  if (error) {
    await supabase.from("pending_invitations").delete()
      .eq("email", email.trim().toLowerCase()).eq("company_id", companyId);
    return { error: error.message };
  }

  await supabase.from("activity_logs").insert({
    company_id:  companyId,
    user_id:     profile.id,
    action:      "user.invited",
    entity_type: "user",
    details:     { email, role },
  });

  revalidatePath("/guards");
  revalidatePath("/supervisors");
  return { ok: true };
}

export async function setUserActive(userId, isActive) {
  const { profile } = await requireAuth();
  if (!["management", "super_admin"].includes(profile.role)) return { error: "Unauthorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .eq("company_id", profile.company_id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    company_id:  profile.company_id,
    user_id:     profile.id,
    action:      isActive ? "user.activated" : "user.deactivated",
    entity_type: "user",
    entity_id:   userId,
  });

  revalidatePath("/guards");
  revalidatePath("/supervisors");
  revalidatePath("/user-roles");
  return { ok: true };
}

export async function changeUserRole(userId, newRole) {
  const { profile } = await requireAuth();
  if (!["management", "super_admin"].includes(profile.role)) return { error: "Unauthorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .eq("company_id", profile.company_id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    company_id:  profile.company_id,
    user_id:     profile.id,
    action:      "user.role_changed",
    entity_type: "user",
    entity_id:   userId,
    details:     { new_role: newRole },
  });

  revalidatePath("/user-roles");
  return { ok: true };
}
