import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import IncidentForm from "../IncidentForm";

export const metadata = { title: "Report Incident | FairGround" };

export default async function NewIncidentPage() {
  const { profile } = await requireAuth();

  if (!["guard", "rover", "supervisor", "management"].includes(profile.role)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, client_name")
    .eq("company_id", profile.company_id)
    .eq("status", "active")
    .order("client_name");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Report Incident</h1>
        <p className="page-subtitle">Fill in the details. You can save as draft and submit later.</p>
      </div>
      <IncidentForm profile={profile} clients={clients || []} />
    </div>
  );
}
