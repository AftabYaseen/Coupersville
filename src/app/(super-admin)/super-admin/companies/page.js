import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import { Globe } from "lucide-react";
import { PageHeader, EmptyState, RelativeTime } from "@/components/ui";
import CompaniesActions from "./CompaniesActions";

export const metadata = { title: "Companies | Super Admin" };

export default async function SuperAdminCompaniesPage({ searchParams }) {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase = await createServiceClient();
  const sp       = await searchParams;
  const search   = sp?.q || "";

  let query = supabase
    .from("companies")
    .select("id, company_name, business_type, status, is_active, created_at, subscription")
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("company_name", `%${search}%`);

  const { data: companies } = await query;

  return (
    <div>
      <PageHeader title="Companies" subtitle={`${companies?.length ?? 0} tenants`} />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={search}
          className="input w-full max-w-sm"
          placeholder="Search by company name..."
        />
      </form>

      {companies?.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Company</th><th>Type</th><th>Plan</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-white">{c.company_name}</td>
                  <td className="text-slate-400 capitalize">{c.business_type || "--"}</td>
                  <td className="text-slate-400">{c.subscription?.plan || "beta"}</td>
                  <td>
                    <span className={
                      c.status === "active"    ? "badge-green" :
                      c.status === "suspended" ? "badge-red"   : "badge-slate"
                    }>{c.status}</span>
                  </td>
                  <td><RelativeTime date={c.created_at} /></td>
                  <td><CompaniesActions companyId={c.id} currentStatus={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Globe} title="No companies" body="No companies registered yet." />
      )}
    </div>
  );
}
