import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import { Lightbulb } from "lucide-react";
import { PageHeader, EmptyState, RelativeTime } from "@/components/ui";
import SuggestionActions from "./SuggestionActions";

export const metadata = { title: "Suggestions | Super Admin" };

const STATUS_COLORS = {
  new:      "badge-blue",
  reviewed: "badge-yellow",
  planned:  "badge-blue",
  done:     "badge-green",
  declined: "badge-slate",
};

export default async function SuperAdminSuggestionsPage({ searchParams }) {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase   = await createServiceClient();
  const sp         = await searchParams;
  const statusFilter = sp?.status || "";

  let query = supabase
    .from("suggestions")
    .select(`
      id, title, body, status, created_at,
      submitter:profiles!suggestions_submitted_by_fkey(full_name, email),
      companies(company_name)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: suggestions } = await query;

  return (
    <div>
      <PageHeader
        title="Suggestions"
        subtitle={`${suggestions?.length ?? 0} suggestion${suggestions?.length !== 1 ? "s" : ""}`}
      />

      <form className="mb-4">
        <select name="status" defaultValue={statusFilter} className="input w-auto text-sm"
          onChange={(e) => { if (typeof window !== "undefined") { const u = new URL(window.location); u.searchParams.set("status", e.target.value); window.location = u; }}}>
          <option value="">All statuses</option>
          {["new","reviewed","planned","done","declined"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </form>

      {suggestions?.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={STATUS_COLORS[s.status] || "badge-slate"}>{s.status}</span>
                    <h3 className="text-white font-medium">{s.title}</h3>
                  </div>
                  {s.body && (
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{s.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>{s.submitter?.full_name || s.submitter?.email || "Anonymous"}</span>
                    {s.companies?.company_name && <span>@ {s.companies.company_name}</span>}
                    <RelativeTime date={s.created_at} />
                  </div>
                </div>
                <SuggestionActions suggestionId={s.id} currentStatus={s.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Lightbulb} title="No suggestions" body="Users can submit suggestions from their dashboard." />
      )}
    </div>
  );
}
