import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import UserRolesClient from "./UserRolesClient";

export const metadata = { title: "User Roles | FairGround" };

export default async function UserRolesPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("company_id", profile.company_id)
    .neq("id", profile.id)
    .order("full_name");

  return <UserRolesClient users={users || []} currentUserId={profile.id} />;
}
