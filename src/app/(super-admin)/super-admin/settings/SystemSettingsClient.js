"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { saveSystemSettings } from "./actions";

export default function SystemSettingsClient({ settings }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const logoRef            = useRef(null);

  const [platformName, setPlatformName] = useState(
    typeof settings.platform_name === "string"
      ? settings.platform_name
      : JSON.stringify(settings.platform_name ?? "FairGround")
  );
  const [maintenance, setMaintenance] = useState(settings.maintenance === true || settings.maintenance === "true");
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    settings.platform_logo && settings.platform_logo !== "null" ? settings.platform_logo : null
  );
  const [feedback, setFeedback] = useState(null);

  function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    start(async () => {
      let logoUrl = settings.platform_logo || null;

      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        fd.append("companyId", "system");
        const res  = await fetch("/api/upload-logo", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) logoUrl = json.url;
      }

      const result = await saveSystemSettings({
        platform_name:  platformName.replace(/^"|"$/g, ""),
        platform_logo:  logoUrl,
        maintenance,
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
    <div className="max-w-xl mx-auto">
      <PageHeader title="System Settings" subtitle="Platform-wide configuration." />

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Platform identity</h2>

          <div>
            <label className="label">Platform name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="input"
              placeholder="FairGround"
            />
          </div>

          <div>
            <label className="label">Platform logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700
                flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Upload size={20} className="text-slate-600" />
                )}
              </div>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="btn-secondary btn-sm"
              >
                <Upload size={14} /> Upload
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Platform status</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600
                focus:ring-blue-500 focus:ring-offset-slate-950"
            />
            <div>
              <p className="text-sm font-medium text-white">Maintenance mode</p>
              <p className="text-xs text-slate-500">Disables access for non-super-admin users.</p>
            </div>
          </label>
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

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending
            ? <><Loader2 size={14} className="animate-spin" />Saving...</>
            : "Save settings"}
        </button>
      </form>
    </div>
  );
}
