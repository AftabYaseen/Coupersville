import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { Plus, Building2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import ClientsClient from "./ClientsClient";

export const metadata = { title: "Clients | FairGround" };

export default async function ClientsPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("client_name");

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients?.length ?? 0} client${clients?.length !== 1 ? "s" : ""}`}
      />
      <ClientsClient clients={clients || []} companyId={profile.company_id} />
    </div>
  );
}
