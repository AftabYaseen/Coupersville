import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CheckInClient from "./CheckInClient";

export const metadata = { title: "Check In | FairGround" };

export default async function CheckInPage() {
  const { profile } = await requireAuth();
  const supabase    = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's check-ins for context
  const { data: todayCheckins } = await supabase
    .from("check_ins")
    .select("*, clients(client_name)")
    .eq("user_id", profile.id)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  // Clients list for association
  const { data: clients } = await supabase
    .from("clients")
    .select("id, client_name")
    .eq("company_id", profile.company_id)
    .eq("status", "active")
    .order("client_name");

  return (
    <CheckInClient
      profile={profile}
      todayCheckins={todayCheckins || []}
      clients={clients || []}
    />
  );
}
