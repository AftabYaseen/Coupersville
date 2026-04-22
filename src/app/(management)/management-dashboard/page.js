import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  AlertTriangle, Users, Building2, ShieldCheck,
  TrendingUp, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { StatCard, SeverityBadge, StatusBadge, RelativeTime, PageHeader } from "@/components/ui";

export const metadata = { title: "Management Dashboard | FairGround" };

export default async function ManagementDashboardPage() {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase   = await createClient();
  const companyId  = profile.company_id;
  const today      = new Date(); today.setHours(0, 0, 0, 0);

  const [
    { count: totalIncidents },
    { count: openIncidents },
    { count: criticalIncidents },
    { count: guardsOnShift },
    { count: totalGuards },
    { count: totalClients },
    { data: recentIncidents },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("incidents").select("*", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase.from("incidents").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).in("status", ["open", "in_progress"]),
    supabase.from("incidents").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("severity", "critical")
      .in("status", ["open", "in_progress"]),
    // Guards on shift = those with a shift_start today but no shift_end
    supabase.from("check_ins").select("user_id", { count: "exact", head: true })
      .eq("company_id", companyId).eq("check_in_type", "shift_start")
      .gte("created_at", today.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).in("role", ["guard", "rover"]).eq("is_active", true),
    supabase.from("clients").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("status", "active"),
    supabase.from("incidents")
      .select(`id, title, severity, status, created_at,
        reporter:profiles!incidents_reported_by_fkey(full_name)`)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("activity_logs")
      .select(`id, action, entity_type, details, created_at,
        user:profiles!activity_logs_user_id_fkey(full_name)`)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div>
      <PageHeader
        title="Management Dashboard"
        subtitle={profile.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : ""}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Open incidents"   value={openIncidents ?? 0}     icon={AlertTriangle} color={openIncidents > 0 ? "yellow" : "slate"} />
        <StatCard label="Critical"         value={criticalIncidents ?? 0} icon={XCircle}       color={criticalIncidents > 0 ? "red" : "slate"} />
        <StatCard label="Guards on shift"  value={guardsOnShift ?? 0}     icon={ShieldCheck}   color="blue" />
        <StatCard label="Active clients"   value={totalClients ?? 0}      icon={Building2}     color="green" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total incidents" value={totalIncidents ?? 0} icon={TrendingUp}   color="slate" />
        <StatCard label="Total guards"    value={totalGuards ?? 0}    icon={Users}         color="slate" />
        <Link href="/incidents?status=open"      className="stat-card hover:border-blue-600/50 transition-colors">
          <span className="text-sm text-slate-400">View open</span>
          <span className="text-2xl font-semibold text-blue-400">{openIncidents ?? 0}</span>
          <span className="text-xs text-slate-500">incidents</span>
        </Link>
        <Link href="/reports" className="stat-card hover:border-blue-600/50 transition-colors">
          <span className="text-sm text-slate-400">Reports</span>
          <span className="text-2xl font-semibold text-white">CSV</span>
          <span className="text-xs text-slate-500">export available</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent incidents */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent incidents</h2>
            <Link href="/incidents" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          {recentIncidents?.length ? (
            <div className="space-y-2">
              {recentIncidents.map((inc) => (
                <Link key={inc.id} href={`/incidents/${inc.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50
                    hover:bg-slate-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {inc.reporter?.full_name || "Unknown"}
                    </p>
                  </div>
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge   status={inc.status} />
                  <RelativeTime  date={inc.created_at} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No incidents yet.</p>
          )}
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Activity</h2>
            <Link href="/activity-logs" className="text-xs text-blue-400 hover:text-blue-300">
              Full log
            </Link>
          </div>
          {recentActivity?.length ? (
            <ol className="relative border-l border-slate-800 ml-3 space-y-4">
              {recentActivity.map((log) => (
                <li key={log.id} className="ml-5">
                  <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-slate-700
                    border-2 border-slate-900" />
                  <p className="text-sm text-slate-300">
                    <span className="text-white font-medium">
                      {log.user?.full_name || "System"}
                    </span>
                    {" "}{formatAction(log.action)}
                    {log.details?.title && (
                      <span className="text-slate-400"> &ldquo;{log.details.title}&rdquo;</span>
                    )}
                  </p>
                  <RelativeTime date={log.created_at} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAction(action) {
  const map = {
    "incident.created":       "filed an incident",
    "incident.updated":       "updated an incident",
    "incident.status_changed":"changed incident status",
    "incident.assigned":      "assigned an incident",
    "user.invited":           "invited a user",
    "user.deactivated":       "deactivated a user",
    "check_in.shift_start":   "started a shift",
    "check_in.shift_end":     "ended a shift",
    "check_in.patrol":        "logged a patrol",
  };
  return map[action] || action.replace(/\./g, " ");
}
