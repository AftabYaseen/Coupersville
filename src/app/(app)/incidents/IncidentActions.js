"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown } from "lucide-react";
import { INCIDENT_STATUSES } from "@/lib/validators";
import { updateIncidentStatus, assignIncident } from "./actions";

export default function IncidentActions({ incident, staffOptions }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [notes, setNotes]  = useState(incident.notes || "");
  const [feedback, setFeedback] = useState("");

  async function handleStatusChange(e) {
    const status = e.target.value;
    start(async () => {
      const res = await updateIncidentStatus(incident.id, status, undefined);
      if (res.error) setFeedback(res.error);
      else { setFeedback("Status updated."); router.refresh(); }
      setTimeout(() => setFeedback(""), 2500);
    });
  }

  async function handleAssign(e) {
    const assignedTo = e.target.value;
    start(async () => {
      const res = await assignIncident(incident.id, assignedTo || null);
      if (res.error) setFeedback(res.error);
      else { setFeedback("Assigned."); router.refresh(); }
      setTimeout(() => setFeedback(""), 2500);
    });
  }

  async function saveNotes() {
    start(async () => {
      const res = await updateIncidentStatus(incident.id, incident.status, notes);
      if (res.error) setFeedback(res.error);
      else { setFeedback("Notes saved."); router.refresh(); }
      setTimeout(() => setFeedback(""), 2500);
    });
  }

  return (
    <div className="card-sm space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Actions
      </h3>

      {feedback && (
        <p className="text-xs text-green-400">{feedback}</p>
      )}

      <div>
        <label className="label text-xs">Status</label>
        <div className="relative">
          <select
            defaultValue={incident.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className="input pr-8 text-sm"
          >
            {INCIDENT_STATUSES.filter((s) => s.value !== "draft").map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2
            text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="label text-xs">Assign to</label>
        <select
          defaultValue={incident.assigned_to || ""}
          onChange={handleAssign}
          disabled={isPending}
          className="input text-sm"
        >
          <option value="">Unassigned</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-xs">Internal notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input resize-none text-sm"
          placeholder="Add internal notes..."
        />
        <button
          onClick={saveNotes}
          disabled={isPending}
          className="btn-secondary btn-sm mt-2 w-full"
        >
          {isPending
            ? <><Loader2 size={12} className="animate-spin" />Saving...</>
            : "Save notes"
          }
        </button>
      </div>
    </div>
  );
}
