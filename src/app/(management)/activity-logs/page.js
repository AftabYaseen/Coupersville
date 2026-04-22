import { requireAuth } from "@/lib/auth";
import { requireMinRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { ActivitySquare } from "lucide-react";
import { PageHeader, EmptyState, RelativeTime } from "@/components/ui";

export const metadata = { title: "Activity Logs | FairGround" };

export default async function ActivityLogsPage({ searchParams }) {
  const { profile } = await requireAuth();
  requireMinRole(profile, "management");

  const supabase = await createClient();
  const sp       = await searchParams;
  const page     = parseInt(sp?.page || "1");
  const pageSize = 50;

  const { data: logs, count } = await supabase
    .from("activity_logs")
    .select(`
      id, action, entity_type, entity_id, details, ip_address, created_at,
      user:profiles!activity_logs_user_id_fkey(full_name, email)
    `, { count: "exact" })
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        subtitle={`${count ?? 0} total events`}
      />

      {logs?.length > 0 ? (
        <>
          <div className="table-wrapper mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th><th>User</th><th>Entity</th><th>Details</th><th>IP</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="text-slate-400">
                      {log.user?.full_name || log.user?.email || "System"}
                    </td>
                    <td className="text-slate-500 text-xs capitalize">
                      {log.entity_type || "--"}
                    </td>
                    <td className="text-slate-500 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "--"}
                    </td>
                    <td className="text-slate-600 text-xs font-mono">
                      {log.ip_address || "--"}
                    </td>
                    <td><RelativeTime date={log.created_at} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <a href={`?page=${page - 1}`} className="btn-secondary btn-sm">Previous</a>
              )}
              <span className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a href={`?page=${page + 1}`} className="btn-secondary btn-sm">Next</a>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={ActivitySquare} title="No activity yet" body="Activity will appear here as your team uses the platform." />
      )}
    </div>
  );
}
