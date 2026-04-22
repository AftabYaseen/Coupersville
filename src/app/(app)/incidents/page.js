import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import {
  PageHeader, StatusBadge, SeverityBadge,
  RelativeTime, EmptyState,
} from "@/components/ui";
import IncidentFilters from "./IncidentFilters";

export const metadata = { title: "Incidents | FairGround" };

export default async function IncidentsPage({ searchParams }) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();
  const sp          = await searchParams;

  const statusFilter   = sp?.status   || "";
  const severityFilter = sp?.severity || "";
  const categoryFilter = sp?.category || "";

  let query = supabase
    .from("incidents")
    .select(`
      id, title, status, severity, category,
      created_at, resolved_at,
      reported_by, assigned_to,
      reporter:profiles!incidents_reported_by_fkey(full_name),
      assignee:profiles!incidents_assigned_to_fkey(full_name),
      clients(client_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // Guards only see their own
  if (profile.role === "guard" || profile.role === "rover") {
    query = query.eq("reported_by", profile.id);
  } else {
    query = query.eq("company_id", profile.company_id);
  }

  if (statusFilter)   query = query.eq("status", statusFilter);
  if (severityFilter) query = query.eq("severity", severityFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  const { data: incidents, error } = await query;

  const canCreate = ["guard", "rover", "supervisor", "management"].includes(profile.role);

  return (
    <div>
      <PageHeader
        title="Incidents"
        subtitle={`${incidents?.length ?? 0} incident${incidents?.length !== 1 ? "s" : ""}`}
        action={
          canCreate && (
            <Link href="/incidents/new" className="btn-primary">
              <Plus size={16} />
              Report incident
            </Link>
          )
        }
      />

      <IncidentFilters
        statusFilter={statusFilter}
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
      />

      {error && (
        <p className="text-red-400 text-sm mb-4">{error.message}</p>
      )}

      {incidents && incidents.length > 0 ? (
        <div className="table-wrapper mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reporter</th>
                <th>Client</th>
                <th>Filed</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="text-white font-medium hover:text-blue-400 transition-colors"
                    >
                      {inc.title}
                    </Link>
                  </td>
                  <td className="capitalize text-slate-400">
                    {inc.category?.replace("_", " ") || "--"}
                  </td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><StatusBadge status={inc.status} /></td>
                  <td className="text-slate-400">
                    {inc.reporter?.full_name || "--"}
                  </td>
                  <td className="text-slate-400">
                    {inc.clients?.client_name || "--"}
                  </td>
                  <td><RelativeTime date={inc.created_at} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={AlertTriangle}
            title="No incidents found"
            body={statusFilter || severityFilter ? "Try clearing filters." : "No incidents have been filed yet."}
            action={
              canCreate && (
                <Link href="/incidents/new" className="btn-primary">
                  <Plus size={16} />
                  Report your first incident
                </Link>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
