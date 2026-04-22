"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2, Loader2 } from "lucide-react";
import { Modal, ConfirmDialog, EmptyState } from "@/components/ui";
import { upsertClient, deleteClient } from "./actions";

const EMPTY = { client_name: "", contact_person: "", email: "", phone: "", address: "", notes: "", status: "active" };

export default function ClientsClient({ clients, companyId }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [editing, setEditing]         = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [errors, setErrors]           = useState({});
  const [feedback, setFeedback]       = useState("");

  function openAdd() { setEditing(null); setForm(EMPTY); setErrors({}); setModalOpen(true); }
  function openEdit(c) { setEditing(c); setForm({ ...c }); setErrors({}); setModalOpen(true); }
  function openDelete(c) { setDeleting(c); setDeleteOpen(true); }

  function set(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })); }

  function validate() {
    const e = {};
    if (!form.client_name.trim()) e.client_name = "Name is required.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSave() {
    if (!validate()) return;
    start(async () => {
      const res = await upsertClient({ ...form, companyId, id: editing?.id });
      if (res.error) { setFeedback(res.error); return; }
      setModalOpen(false);
      router.refresh();
    });
  }

  async function handleDelete() {
    start(async () => {
      await deleteClient(deleting.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add client
        </button>
      </div>

      {clients.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-white">{c.client_name}</td>
                  <td className="text-slate-400">{c.contact_person || "--"}</td>
                  <td className="text-slate-400">{c.email || "--"}</td>
                  <td className="text-slate-400">{c.phone || "--"}</td>
                  <td>
                    <span className={c.status === "active" ? "badge-green" : "badge-slate"}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="btn-ghost btn-sm p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => openDelete(c)} className="btn-ghost btn-sm p-1 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Building2} title="No clients yet"
          body="Add your first client to start associating incidents and security codes."
          action={<button onClick={openAdd} className="btn-primary"><Plus size={16} />Add client</button>}
        />
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Edit client" : "Add client"}>
        <div className="space-y-4">
          {feedback && <p className="text-sm text-red-400">{feedback}</p>}
          {[
            { f: "client_name", label: "Name *", placeholder: "Northgate Mall" },
            { f: "contact_person", label: "Contact person", placeholder: "Tom Reyes" },
            { f: "email", label: "Email", placeholder: "contact@client.com", type: "email" },
            { f: "phone", label: "Phone", placeholder: "555-0100" },
            { f: "address", label: "Address", placeholder: "123 Main St" },
          ].map(({ f, label, placeholder, type }) => (
            <div key={f}>
              <label className="label">{label}</label>
              <input type={type || "text"} value={form[f]} onChange={set(f)}
                className="input" placeholder={placeholder} />
              {errors[f] && <p className="field-error">{errors[f]}</p>}
            </div>
          ))}
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={set("notes")}
              rows={2} className="input resize-none" placeholder="Optional notes..." />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={set("status")} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isPending} className="btn-primary">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing ? "Save changes" : "Add client"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete} danger
        title="Delete client"
        body={`Delete "${deleting?.client_name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}
