import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import IncidentForm from "../../IncidentForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Edit Incident | FairGround" };

export default async function EditIncidentPage({ params }) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();
  const { id }      = await params;

  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .single();

  if (!incident) notFound();

  // Guards can only edit their own drafts
  if (
    (profile.role === "guard" || profile.role === "rover") &&
    (incident.reported_by !== profile.id || incident.status !== "draft")
  ) {
    redirect(`/incidents/${id}`);
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, client_name")
    .eq("company_id", profile.company_id)
    .eq("status", "active")
    .order("client_name");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/incidents/${id}`} className="btn-ghost btn-sm">
          <ArrowLeft size={14} />
          Back to incident
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="page-title">Edit Incident</h1>
      </div>
      <IncidentForm
        profile={profile}
        clients={clients || []}
        incident={incident}
      />
    </div>
  );
}
