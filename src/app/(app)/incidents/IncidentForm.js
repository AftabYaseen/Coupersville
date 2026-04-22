"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Paperclip, X, Navigation, CheckCircle2 } from "lucide-react";
import { INCIDENT_CATEGORIES, INCIDENT_SEVERITIES } from "@/lib/validators";
import { saveIncident } from "./actions";

export default function IncidentForm({ profile, clients, incident = null }) {
  const router   = useRouter();
  const fileRef  = useRef(null);
  const isEdit   = !!incident;

  const [form, setForm] = useState({
    title:       incident?.title       || "",
    description: incident?.description || "",
    category:    incident?.category    || "",
    severity:    incident?.severity    || "medium",
    notes:       incident?.notes       || "",
    client_id:   incident?.client_id   || "",
  });

  const [location, setLocation]     = useState(incident?.location || null);
  const [locating, setLocating]     = useState(false);
  const [locError, setLocError]     = useState("");
  const [files, setFiles]           = useState([]);
  const [existingUrls]              = useState(incident?.evidence_urls || []);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [submitType, setSubmitType] = useState("draft");

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  async function getLocation() {
    setLocError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocating(false);
      },
      (err) => {
        setLocError("Could not get location: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function addFiles(e) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim())  errs.title    = "Title is required.";
    if (!form.category)      errs.category = "Category is required.";
    if (!form.severity)      errs.severity = "Severity is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(status) {
    if (!validate()) return;
    setSubmitType(status);
    setLoading(true);

    try {
      // Upload files to Supabase Storage via FormData
      const uploadedUrls = [...existingUrls];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        fd.append("companyId", profile.company_id);
        fd.append("incidentId", incident?.id || "new");

        const res = await fetch("/api/upload-evidence", { method: "POST", body: fd });
        const json = await res.json();
        if (json.urls) uploadedUrls.push(...json.urls);
      }

      const result = await saveIncident({
        incidentId:   incident?.id || null,
        companyId:    profile.company_id,
        reportedBy:   profile.id,
        status,
        location,
        evidenceUrls: uploadedUrls,
        ...form,
        client_id: form.client_id || null,
      });

      if (result.error) {
        setErrors({ submit: result.error });
      } else {
        router.push(`/incidents/${result.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="card space-y-4">
        <div>
          <label className="label">Title <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            className="input"
            placeholder="Brief description of the incident"
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={4}
            className="input resize-none"
            placeholder="Detailed account of what happened..."
          />
        </div>
      </div>

      {/* Category, Severity, Client */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category <span className="text-red-400">*</span></label>
          <select value={form.category} onChange={set("category")} className="input">
            <option value="">Select category...</option>
            {INCIDENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div>
          <label className="label">Severity <span className="text-red-400">*</span></label>
          <select value={form.severity} onChange={set("severity")} className="input">
            {INCIDENT_SEVERITIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.severity && <p className="field-error">{errors.severity}</p>}
        </div>

        {clients.length > 0 && (
          <div className="sm:col-span-2">
            <label className="label">Client / Site (optional)</label>
            <select value={form.client_id} onChange={set("client_id")} className="input">
              <option value="">No specific client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.client_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Location</label>
          <button
            type="button"
            onClick={getLocation}
            disabled={locating}
            className="btn-ghost btn-sm"
          >
            {locating
              ? <><Loader2 size={12} className="animate-spin" />Locating...</>
              : <><Navigation size={12} />Capture location</>}
          </button>
        </div>

        {location ? (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 size={14} />
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            {location.accuracy && (
              <span className="text-slate-500 text-xs">(±{location.accuracy}m)</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {locError || "No location captured."}
          </p>
        )}

        <input
          type="text"
          value={location?.address || ""}
          onChange={(e) =>
            setLocation((l) => ({ ...(l || {}), address: e.target.value }))
          }
          className="input mt-3"
          placeholder="Address or location description (optional)"
        />
      </div>

      {/* Evidence */}
      <div className="card">
        <label className="label">Evidence (photos, files)</label>

        {existingUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                File {i + 1}
              </a>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <ul className="space-y-1 mb-3">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <Paperclip size={12} className="text-slate-500" />
                <span className="truncate flex-1">{f.name}</span>
                <span className="text-slate-500 text-xs">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-secondary btn-sm"
        >
          <Paperclip size={14} />
          Attach files
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.mp4,.mov"
          className="hidden"
          onChange={addFiles}
        />
        <p className="text-xs text-slate-500 mt-2">
          Max 5 files. Images, PDFs, or video up to 20 MB each.
        </p>
      </div>

      {/* Management notes (only management+ can see/set) */}
      {["management", "supervisor"].includes(profile.role) && (
        <div className="card">
          <label className="label">Internal notes</label>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            rows={3}
            className="input resize-none"
            placeholder="Internal notes visible only to management..."
          />
        </div>
      )}

      {errors.submit && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {errors.submit}
        </p>
      )}

      {/* Submit buttons */}
      <div className="flex gap-3 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="btn-secondary"
        >
          {loading && submitType === "draft"
            ? <><Loader2 size={14} className="animate-spin" />Saving...</>
            : "Save draft"
          }
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("open")}
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading && submitType === "open"
            ? <><Loader2 size={14} className="animate-spin" />Submitting...</>
            : isEdit ? "Update incident" : "Submit incident"
          }
        </button>
      </div>
    </div>
  );
}
