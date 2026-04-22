"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { BUSINESS_TYPES } from "@/lib/validators";
import { saveCompanySettings } from "./actions";

export default function CompanySettingsClient({ company }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const logoRef            = useRef(null);

  const [form, setForm] = useState({
    company_name:  company.company_name  || "",
    business_type: company.business_type || "",
    service_type:  company.service_type  || "",
  });

  const [colors, setColors] = useState({
    primary:   company.color_scheme?.primary   || "#3b82f6",
    secondary: company.color_scheme?.secondary || "#1e40af",
    accent:    company.color_scheme?.accent    || "#60a5fa",
  });

  const [logoFile, setLogoFile]     = useState(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || null);
  const [feedback, setFeedback]     = useState(null);
  const [errors, setErrors]         = useState({});

  function set(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })); }
  function setColor(f) { return (e) => setColors((p) => ({ ...p, [f]: e.target.value })); }

  function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function validate() {
    const e = {};
    if (!form.company_name.trim()) e.company_name = "Company name is required.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    start(async () => {
      let logoUrl = company.logo_url;

      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        fd.append("companyId", company.id);
        const res  = await fetch("/api/upload-logo", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) logoUrl = json.url;
      }

      const result = await saveCompanySettings({
        company_name:  form.company_name.trim(),
        business_type: form.business_type || null,
        service_type:  form.service_type.trim() || null,
        color_scheme:  colors,
        logo_url:      logoUrl,
        companyId:     company.id,
      });

      if (result.error) {
        setFeedback({ ok: false, message: result.error });
      } else {
        setFeedback({ ok: true, message: "Settings saved." });
        router.refresh();
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Company Settings" subtitle="Manage your company profile and branding." />

      <form onSubmit={handleSave} className="space-y-5">
        {/* Logo */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Company logo</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700
              flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Upload size={24} className="text-slate-600" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="btn-secondary btn-sm"
              >
                <Upload size={14} /> Upload logo
              </button>
              <p className="text-xs text-slate-500 mt-2">PNG, JPG, SVG or WebP. Max 5 MB.</p>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoChange}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Company details</h2>
          <div>
            <label className="label">Company name *</label>
            <input
              type="text"
              value={form.company_name}
              onChange={set("company_name")}
              className="input"
              placeholder="Apex Security Group"
            />
            {errors.company_name && <p className="field-error">{errors.company_name}</p>}
          </div>
          <div>
            <label className="label">Business type</label>
            <select value={form.business_type} onChange={set("business_type")} className="input">
              <option value="">Select...</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Service type (optional)</label>
            <input
              type="text"
              value={form.service_type}
              onChange={set("service_type")}
              className="input"
              placeholder="Commercial and residential security"
            />
          </div>
        </div>

        {/* Color scheme */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Brand colors</h2>
          <p className="text-xs text-slate-500">
            These override the default blue theme on your company&apos;s branded surfaces.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { f: "primary",   label: "Primary" },
              { f: "secondary", label: "Secondary" },
              { f: "accent",    label: "Accent" },
            ].map(({ f, label }) => (
              <div key={f}>
                <label className="label text-xs">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[f]}
                    onChange={setColor(f)}
                    className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800
                      cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colors[f]}
                    onChange={setColor(f)}
                    className="input font-mono text-xs"
                    placeholder="#3b82f6"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-2 h-10 rounded-lg flex overflow-hidden border border-slate-800"
            title="Color preview"
          >
            <div className="flex-1" style={{ background: colors.primary }} />
            <div className="flex-1" style={{ background: colors.secondary }} />
            <div className="flex-1" style={{ background: colors.accent }} />
          </div>
        </div>

        {feedback && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg
            ${feedback.ok
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
            {feedback.ok && <CheckCircle2 size={14} />}
            {feedback.message}
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full btn-lg">
          {isPending
            ? <><Loader2 size={16} className="animate-spin" />Saving...</>
            : "Save settings"}
        </button>
      </form>
    </div>
  );
}
