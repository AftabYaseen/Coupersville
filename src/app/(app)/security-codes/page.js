import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import SecurityCodesClient from "./SecurityCodesClient";

export const metadata = { title: "Security Codes | FairGround" };

export default async function SecurityCodesPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  // Use service client to call the decrypt RPC which needs elevated privileges
  const supabase = await createServiceClient();

  // Decrypt codes server-side using pgcrypto via RPC
  const { data: codes } = await supabase.rpc("get_decrypted_security_codes", {
    p_company_id: profile.company_id,
    p_passphrase: process.env.SECURITY_CODE_SECRET || "dev_secret_change_me",
  });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, client_name")
    .eq("company_id", profile.company_id)
    .eq("status", "active")
    .order("client_name");

  return (
    <SecurityCodesClient
      codes={codes || []}
      clients={clients || []}
      companyId={profile.company_id}
    />
  );
}
