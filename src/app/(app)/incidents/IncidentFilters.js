"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { INCIDENT_CATEGORIES, INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/validators";

export default function IncidentFilters({ statusFilter, severityFilter, categoryFilter }) {
  const router     = useRouter();
  const pathname   = usePathname();
  const sp         = useSearchParams();

  function update(key, value) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = statusFilter || severityFilter || categoryFilter;

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      <select
        value={statusFilter}
        onChange={(e) => update("status", e.target.value)}
        className="input w-auto text-sm"
      >
        <option value="">All statuses</option>
        {INCIDENT_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={severityFilter}
        onChange={(e) => update("severity", e.target.value)}
        className="input w-auto text-sm"
      >
        <option value="">All severities</option>
        {INCIDENT_SEVERITIES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => update("category", e.target.value)}
        className="input w-auto text-sm"
      >
        <option value="">All categories</option>
        {INCIDENT_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="btn-ghost text-sm"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
