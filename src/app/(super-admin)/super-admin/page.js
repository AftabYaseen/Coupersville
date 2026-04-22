import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Globe, Users, AlertTriangle, Building2, BarChart3 } from "lucide-react";
import { StatCard, PageHeader, RelativeTime } from "@/components/ui";

export const metadata = { title: "Super Admin | FairGround" };

export default async function SuperAdminPage() {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase = await createServiceClient();

  const [
    { count: totalCompanies },
    { count: totalUsers },
    { count: totalIncidents },
    { count: activeCompanies },
    { data: recentCompanies },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "super_admin"),
    supabase.from("incidents").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("companies").select("id, company_name, status, created_at, business_type")
      .order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("id, full_name, email, role, created_at")
      .neq("role", "super_admin").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div>
      <PageHeader
        title="Super Admin"
        subtitle="Platform-wide overview."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total companies"  value={totalCompanies  ?? 0} icon={Globe}          color="blue" />
        <StatCard label="Active companies" value={activeCompanies ?? 0} icon={Building2}      color="green" />
        <StatCard label="Total users"      value={totalUsers      ?? 0} icon={Users}          color="slate" />
        <StatCard label="Total incidents"  value={totalIncidents  ?? 0} icon={AlertTriangle}  color="yellow" />
      </div>

      {/* Quick nav tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/super-admin/companies",   label: "Companies",    icon: Globe,         desc: "All tenants" },
          { href: "/super-admin/users",        label: "All Users",    icon: Users,         desc: "Cross-tenant search" },
          { href: "/super-admin/stats",        label: "Stats",        icon: BarChart3,     desc: "Platform metrics" },
          { href: "/super-admin/suggestions",  label: "Suggestions",  icon: AlertTriangle, desc: "User feedback" },
          { href: "/super-admin/payments",     label: "Payments",     icon: Building2,     desc: "Billing (stub)" },
          { href: "/super-admin/settings",     label: "Settings",     icon: Globe,         desc: "Platform config" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="card flex items-center gap-4 hover:border-blue-600/50 transition-colors group">
            <span className="p-2.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-medium text-white text-sm">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent companies */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent companies</h2>
            <Link href="/super-admin/companies" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentCompanies?.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{c.company_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{c.business_type || "--"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={c.status === "active" ? "badge-green" : "badge-slate"}>{c.status}</span>
                  <RelativeTime date={c.created_at} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent users</h2>
            <Link href="/super-admin/users" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers?.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{u.full_name || u.email}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-slate capitalize">{u.role}</span>
                  <RelativeTime date={u.created_at} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
