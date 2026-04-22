"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveIncident(data) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();

  const {
    incidentId, companyId, reportedBy, status,
    title, description, category, severity,
    client_id, location, evidenceUrls, notes,
  } = data;

  // Guards can only save for themselves
  if (profile.role === "guard" || profile.role === "rover") {
    if (reportedBy !== profile.id) return { error: "Unauthorized." };
    // Guards can only update drafts they own
    if (incidentId) {
      const { data: existing } = await supabase
        .from("incidents")
        .select("reported_by, status")
        .eq("id", incidentId)
        .single();
      if (!existing || existing.reported_by !== profile.id || existing.status !== "draft") {
        return { error: "You can only edit your own draft incidents." };
      }
    }
  }

  const payload = {
    company_id:    companyId,
    reported_by:   reportedBy,
    title:         title.trim(),
    description:   description?.trim() || null,
    category:      category || null,
    severity:      severity || "medium",
    status:        status || "draft",
    client_id:     client_id || null,
    location:      location || null,
    evidence_urls: evidenceUrls || [],
    notes:         notes?.trim() || null,
  };

  let id = incidentId;

  if (incidentId) {
    const { error } = await supabase
      .from("incidents")
      .update(payload)
      .eq("id", incidentId);
    if (error) return { error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("incidents")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { error: error.message };
    id = created.id;
  }

  // Activity log
  await supabase.from("activity_logs").insert({
    company_id:  companyId,
    user_id:     profile.id,
    action:      incidentId ? "incident.updated" : "incident.created",
    entity_type: "incident",
    entity_id:   id,
    details:     { title: title.trim(), status },
  });

  revalidatePath("/incidents");
  return { ok: true, id };
}

export async function updateIncidentStatus(incidentId, status, notes) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();

  if (!["management", "supervisor", "super_admin"].includes(profile.role)) {
    return { error: "Unauthorized." };
  }

  const update = { status };
  if (notes !== undefined) update.notes = notes;

  const { error } = await supabase
    .from("incidents")
    .update(update)
    .eq("id", incidentId)
    .eq("company_id", profile.company_id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    company_id:  profile.company_id,
    user_id:     profile.id,
    action:      "incident.status_changed",
    entity_type: "incident",
    entity_id:   incidentId,
    details:     { to: status },
  });

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  return { ok: true };
}

export async function assignIncident(incidentId, assignedTo) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();

  if (!["management", "super_admin"].includes(profile.role)) {
    return { error: "Unauthorized." };
  }

  const { error } = await supabase
    .from("incidents")
    .update({ assigned_to: assignedTo || null })
    .eq("id", incidentId)
    .eq("company_id", profile.company_id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    company_id:  profile.company_id,
    user_id:     profile.id,
    action:      "incident.assigned",
    entity_type: "incident",
    entity_id:   incidentId,
    details:     { assigned_to: assignedTo },
  });

  revalidatePath(`/incidents/${incidentId}`);
  return { ok: true };
}
