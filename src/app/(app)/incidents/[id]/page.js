import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, MapPin, Paperclip } from "lucide-react";
import {
  StatusBadge, SeverityBadge, RelativeTime, PageHeader,
} from "@/components/ui";
import IncidentActions from "../IncidentActions";

export default async function IncidentDetailPage({ params }) {
  const { profile } = await requireAuth();
  const supabase    = await createClient();
  const { id }      = await params;

  const { data: incident } = await supabase
    .from("incidents")
    .select(`
      *,
      reporter:profiles!incidents_reported_by_fkey(id, full_name, email),
      assignee:profiles!incidents_assigned_to_fkey(id, full_name, email),
      clients(id, client_name)
    `)
    .eq("id", id)
    .single();

  if (!incident) notFound();

  // Access check: guards can only see their own
  if (
    (profile.role === "guard" || profile.role === "rover") &&
    incident.reported_by !== profile.id
  ) {
    notFound();
  }

  const canEdit = (
    (profile.role === "guard" || profile.role === "rover") &&
    incident.reported_by === profile.id &&
    incident.status === "draft"
  );

  const canManage = ["management", "supervisor", "super_admin"].includes(profile.role);

  // Staff list for assignment (management only)
  let staffOptions = [];
  if (canManage) {
    const { data: staff } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("company_id", profile.company_id)
      .in("role", ["guard", "rover", "supervisor"])
      .eq("is_active", true)
      .order("full_name");
    staffOptions = staff || [];
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/incidents" className="btn-ghost btn-sm">
          <ArrowLeft size={14} />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="page-title">{incident.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="text-sm text-slate-500 capitalize">
              {incident.category?.replace("_", " ")}
            </span>
            <RelativeTime date={incident.created_at} />
          </div>
        </div>
        {canEdit && (
          <Link href={`/incidents/${id}/edit`} className="btn-secondary btn-sm">
            <Edit size={14} />
            Edit draft
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {incident.description && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Description</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>
          )}

          {incident.location && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin size={14} />
                Location
              </h2>
              {incident.location.address && (
                <p className="text-slate-300 text-sm mb-1">{incident.location.address}</p>
              )}
              {incident.location.lat && (
                <p className="text-slate-500 text-xs font-mono">
                  {incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}
                  {incident.location.accuracy &&
                    ` (±${incident.location.accuracy}m)`}
                </p>
              )}
            </div>
          )}

          {incident.evidence_urls?.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Paperclip size={14} />
                Evidence ({incident.evidence_urls.length} file{incident.evidence_urls.length !== 1 ? "s" : ""})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {incident.evidence_urls.map((url, i) => {
                  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
                  return isImage ? (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`Evidence ${i + 1}`}
                        className="w-full h-28 object-cover rounded-lg border border-slate-700
                          hover:border-blue-500 transition-colors"
                      />
                    </a>
                  ) : (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800
                        text-sm text-blue-400 hover:bg-slate-700 transition-colors"
                    >
                      <Paperclip size={12} />
                      File {i + 1}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {incident.notes && canManage && (
            <div className="card border-slate-700">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Internal notes</h2>
              <p className="text-slate-400 text-sm whitespace-pre-wrap">{incident.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Details
            </h3>
            <Field label="Reported by">
              {incident.reporter?.full_name || incident.reporter?.email || "--"}
            </Field>
            <Field label="Assigned to">
              {incident.assignee?.full_name || "Unassigned"}
            </Field>
            <Field label="Client">
              {incident.clients?.client_name || "--"}
            </Field>
            <Field label="Filed">
              {new Date(incident.created_at).toLocaleString()}
            </Field>
            {incident.resolved_at && (
              <Field label="Resolved">
                {new Date(incident.resolved_at).toLocaleString()}
              </Field>
            )}
          </div>

          {/* Management actions */}
          {canManage && (
            <IncidentActions
              incident={incident}
              staffOptions={staffOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-300 mt-0.5">{children}</p>
    </div>
  );
}
