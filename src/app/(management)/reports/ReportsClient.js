"use client";

import { useState, useTransition } from "react";
import { FileBarChart2, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const REPORTS = [
  {
    id: "incidents_by_category",
    label: "Incidents by Category",
    description: "Total incidents grouped by category and severity.",
  },
  {
    id: "shifts_by_guard",
    label: "Shifts by Guard",
    description: "Check-in and check-out log per guard, filterable by date range.",
  },
  {
    id: "hours_worked",
    label: "Hours Worked",
    description: "Estimated hours per guard based on shift start and end times.",
  },
];

export default function ReportsClient({ companyId }) {
  const [active, setActive]         = useState(REPORTS[0].id);
  const [loading, setLoading]       = useState(false);
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [preview, setPreview]       = useState(null);

  async function fetchData() {
    setLoading(true);
    setPreview(null);
    const supabase = createClient();
    let rows = [];

    const from = dateFrom || "2000-01-01";
    const to   = dateTo   || new Date().toISOString().slice(0, 10);

    if (active === "incidents_by_category") {
      const { data } = await supabase
        .from("incidents")
        .select("category, severity, status, created_at")
        .eq("company_id", companyId)
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59");

      // Aggregate client-side
      const agg = {};
      for (const inc of data || []) {
        const key = `${inc.category}||${inc.severity}`;
        agg[key] = agg[key] || { category: inc.category, severity: inc.severity, count: 0 };
        agg[key].count++;
      }
      rows = Object.values(agg).sort((a, b) => b.count - a.count);
    }

    if (active === "shifts_by_guard") {
      const { data } = await supabase
        .from("check_ins")
        .select(`
          user_id, check_in_type, created_at,
          user:profiles!check_ins_user_id_fkey(full_name, email)
        `)
        .eq("company_id", companyId)
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59")
        .order("created_at", { ascending: true });

      rows = (data || []).map((c) => ({
        guard:    c.user?.full_name || c.user?.email || c.user_id,
        type:     c.check_in_type,
        datetime: new Date(c.created_at).toLocaleString(),
      }));
    }

    if (active === "hours_worked") {
      const { data } = await supabase
        .from("check_ins")
        .select(`
          user_id, check_in_type, created_at,
          user:profiles!check_ins_user_id_fkey(full_name, email)
        `)
        .eq("company_id", companyId)
        .in("check_in_type", ["shift_start", "shift_end"])
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59")
        .order("created_at", { ascending: true });

      // Pair starts with ends per guard per day
      const byGuard = {};
      for (const c of data || []) {
        const key = c.user_id;
        byGuard[key] = byGuard[key] || { name: c.user?.full_name || c.user?.email, sessions: [], open: null };
        if (c.check_in_type === "shift_start") {
          byGuard[key].open = new Date(c.created_at);
        } else if (c.check_in_type === "shift_end" && byGuard[key].open) {
          const hrs = (new Date(c.created_at) - byGuard[key].open) / 3600000;
          byGuard[key].sessions.push(hrs);
          byGuard[key].open = null;
        }
      }
      rows = Object.values(byGuard).map((g) => ({
        guard:         g.name,
        shifts:        g.sessions.length,
        total_hours:   g.sessions.reduce((s, h) => s + h, 0).toFixed(2),
        avg_hours:     g.sessions.length
          ? (g.sessions.reduce((s, h) => s + h, 0) / g.sessions.length).toFixed(2)
          : "0.00",
      }));
    }

    setPreview(rows);
    setLoading(false);
  }

  function downloadCSV() {
    if (!preview?.length) return;
    const headers = Object.keys(preview[0]);
    const lines   = [
      headers.join(","),
      ...preview.map((r) =>
        headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${active}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const reportDef = REPORTS.find((r) => r.id === active);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Export data as CSV for offline analysis."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Report type picker */}
        <div className="space-y-2">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              onClick={() => { setActive(r.id); setPreview(null); }}
              className={`w-full text-left p-4 rounded-xl border transition-colors
                ${active === r.id
                  ? "border-blue-600 bg-blue-600/10 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"}`}
            >
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{r.description}</p>
            </button>
          ))}
        </div>

        {/* Controls + preview */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">{reportDef?.label}</h2>
            <p className="text-sm text-slate-500">{reportDef?.description}</p>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="label text-xs">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input w-auto text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input w-auto text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn-primary"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" />Loading...</>
                  : <><FileBarChart2 size={14} />Generate report</>}
              </button>
              {preview?.length > 0 && (
                <button onClick={downloadCSV} className="btn-secondary">
                  <Download size={14} />
                  Download CSV ({preview.length} rows)
                </button>
              )}
            </div>
          </div>

          {/* Preview table */}
          {preview !== null && (
            <div>
              {preview.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        {Object.keys(preview[0]).map((h) => (
                          <th key={h} className="capitalize">{h.replace(/_/g, " ")}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 100).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="text-slate-300">{String(v ?? "--")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 100 && (
                    <p className="text-xs text-slate-500 p-3">
                      Showing first 100 rows. Download CSV for full data.
                    </p>
                  )}
                </div>
              ) : (
                <div className="card text-center py-10">
                  <p className="text-slate-500 text-sm">
                    No data found for the selected date range.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
