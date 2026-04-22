"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, EyeOff, KeyRound, Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Modal, ConfirmDialog, EmptyState, PageHeader } from "@/components/ui";
import { upsertCode, deleteCode } from "./actions";

const EMPTY = { code_label: "", code_value: "", client_id: "", notes: "", expires_at: "", is_active: true };

export default function SecurityCodesClient({ codes, clients, companyId }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [revealed, setRevealed]     = useState({});
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [errors, setErrors]         = useState({});

  function toggle(id) { setRevealed((p) => ({ ...p, [id]: !p[id] })); }
  function openAdd() { setEditing(null); setForm(EMPTY); setErrors({}); setModalOpen(true); }
  function openEdit(c) {
    setEditing(c);
    setForm({ code_label: c.code_label, code_value: c.code_value, client_id: c.client_id || "", notes: c.notes || "", expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "", is_active: c.is_active });
    setErrors({});
    setModalOpen(true);
  }
  function set(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })); }

  function isExpiring(expires_at) {
    if (!expires_at) return false;
    const diff = new Date(expires_at) - Date.now();
    return diff > 0 && diff < 14 * 86400000; // within 14 days
  }
  function isExpired(expires_at) { return expires_at && new Date(expires_at) < new Date(); }

  function validate() {
    const e = {};
    if (!form.code_label.trim()) e.code_label = "Label is required.";
    if (!form.code_value.trim()) e.code_value = "Code value is required.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSave() {
    if (!validate()) return;
    start(async () => {
      const res = await upsertCode({ ...form, companyId, id: editing?.id });
      if (res.error) { setErrors({ submit: res.error }); return; }
      setModalOpen(false);
      router.refresh();
    });
  }

  async function handleDelete() {
    start(async () => { await deleteCode(deleting.id); router.refresh(); });
  }

  return (
    <div>
      <PageHeader
        title="Security Codes"
        subtitle="Encrypted alarm and access codes. Reveal only when needed."
        action={<button onClick={openAdd} className="btn-primary"><Plus size={16} />Add code</button>}
      />

      {codes.length > 0 ? (
        <div className="table-wrapper mt-4">
          <table className="table">
            <thead>
              <tr><th>Label</th><th>Client</th><th>Code</th><th>Notes</th><th>Expires</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const expired  = isExpired(c.expires_at);
                const expiring = isExpiring(c.expires_at);
                return (
                  <tr key={c.id}>
                    <td className="font-medium text-white">{c.code_label}</td>
                    <td className="text-slate-400">{c.client_name || "--"}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-300">
                          {revealed[c.id] ? c.code_value : "••••••"}
                        </span>
                        <button onClick={() => toggle(c.id)} className="text-slate-500 hover:text-blue-400 transition-colors">
                          {revealed[c.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="text-slate-400 text-sm">{c.notes || "--"}</td>
                    <td>
                      {c.expires_at ? (
                        <span className={`text-xs ${expired ? "text-red-400" : expiring ? "text-yellow-400" : "text-slate-400"}`}>
                          {expired ? "EXPIRED " : expiring ? <AlertTriangle size={10} className="inline mr-1" /> : ""}
                          {new Date(c.expires_at).toLocaleDateString()}
                        </span>
                      ) : "--"}
                    </td>
                    <td>
                      <span className={c.is_active ? "badge-green" : "badge-slate"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="btn-ghost btn-sm p-1"><Pencil size={14} /></button>
                        <button onClick={() => { setDeleting(c); setDeleteOpen(true); }} className="btn-ghost btn-sm p-1 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={KeyRound} title="No security codes" body="Add encrypted access codes tied to client sites."
          action={<button onClick={openAdd} className="btn-primary"><Plus size={16} />Add code</button>}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit code" : "Add security code"}>
        <div className="space-y-4">
          {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}
          <div>
            <label className="label">Label *</label>
            <input value={form.code_label} onChange={set("code_label")} className="input" placeholder="Main Entrance Alarm" />
            {errors.code_label && <p className="field-error">{errors.code_label}</p>}
          </div>
          <div>
            <label className="label">Code value *</label>
            <input type="text" value={form.code_value} onChange={set("code_value")} className="input font-mono" placeholder="1234#" />
            {errors.code_value && <p className="field-error">{errors.code_value}</p>}
            <p className="text-xs text-slate-500 mt-1">Stored encrypted at rest.</p>
          </div>
          <div>
            <label className="label">Client (optional)</label>
            <select value={form.client_id} onChange={set("client_id")} className="input">
              <option value="">No specific client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.client_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <input value={form.notes} onChange={set("notes")} className="input" placeholder="Disarm within 30 seconds" />
          </div>
          <div>
            <label className="label">Expires</label>
            <input type="date" value={form.expires_at} onChange={set("expires_at")} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.is_active ? "true" : "false"}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "true" }))} className="input">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isPending} className="btn-primary">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing ? "Save changes" : "Add code"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        danger title="Delete code" body={`Delete "${deleting?.code_label}"?`} confirmLabel="Delete" />
    </div>
  );
}
