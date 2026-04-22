import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import ReportsClient from "./ReportsClient";

export const metadata = { title: "Reports | FairGround" };

export default async function ReportsPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");
  return <ReportsClient companyId={profile.company_id} />;
}
