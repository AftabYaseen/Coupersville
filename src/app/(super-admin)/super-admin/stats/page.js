import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import { StatCard, PageHeader } from "@/components/ui";
import { Globe, Users, AlertTriangle, Building2, ShieldCheck, FileBarChart2 } from "lucide-react";

export const metadata = { title: "Platform Stats | Super Admin" };

export default async function SuperAdminStatsPage() {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase = await createServiceClient();
  const month    = new Date();
  month.setDate(1); month.setHours(0, 0, 0, 0);

  const [
    { count: totalCompanies },
    { count: activeCompanies },
    { count: totalUsers },
    { count: totalIncidents },
    { count: incidentsThisMonth },
    { count: totalCheckIns },
    { count: checkInsThisMonth },
    { count: openIncidents },
    { count: criticalIncidents },
    { count: totalClients },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "super_admin"),
    supabase.from("incidents").select("*", { count: "exact", head: true }),
    supabase.from("incidents").select("*", { count: "exact", head: true }).gte("created_at", month.toISOString()),
    supabase.from("check_ins").select("*", { count: "exact", head: true }),
    supabase.from("check_ins").select("*", { count: "exact", head: true }).gte("created_at", month.toISOString()),
    supabase.from("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("incidents").select("*", { count: "exact", head: true }).eq("severity", "critical").in("status", ["open", "in_progress"]),
    supabase.from("clients").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <PageHeader title="Platform Stats" subtitle="Aggregate metrics across all tenants." />

      <div className="space-y-8 mt-4">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Companies</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total companies"  value={totalCompanies  ?? 0} icon={Globe}     color="blue" />
            <StatCard label="Active companies" value={activeCompanies ?? 0} icon={Building2} color="green" />
            <StatCard label="Total clients"    value={totalClients    ?? 0} icon={Building2} color="slate" />
            <StatCard label="Total users"      value={totalUsers      ?? 0} icon={Users}     color="slate" />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Incidents</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total incidents"       value={totalIncidents      ?? 0} icon={AlertTriangle} color="slate" />
            <StatCard label="This month"            value={incidentsThisMonth  ?? 0} icon={AlertTriangle} color="blue" />
            <StatCard label="Currently open"        value={openIncidents       ?? 0} icon={AlertTriangle} color="yellow" />
            <StatCard label="Critical open"         value={criticalIncidents   ?? 0} icon={AlertTriangle} color="red" />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Field activity</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total check-ins"   value={totalCheckIns     ?? 0} icon={ShieldCheck} color="slate" />
            <StatCard label="Check-ins (month)" value={checkInsThisMonth ?? 0} icon={ShieldCheck} color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
