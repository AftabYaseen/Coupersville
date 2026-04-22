"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Loader2, UserX, UserCheck } from "lucide-react";
import { Modal, ConfirmDialog, EmptyState, RoleBadge, RelativeTime, PageHeader } from "@/components/ui";
import { inviteUser, setUserActive } from "./actions";

export default function GuardsClient({ guards, companyId, canManage }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [form, setForm]               = useState({ email: "", full_name: "", role: "guard" });
  const [errors, setErrors]           = useState({});
  const [feedback, setFeedback]       = useState("");

  function set(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })); }

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.full_name.trim()) e.full_name = "Name is required.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleInvite() {
    if (!validate()) return;
    start(async () => {
      const res = await inviteUser({ ...form, companyId });
      if (res.error) { setFeedback(res.error); return; }
      setInviteOpen(false);
      setForm({ email: "", full_name: "", role: "guard" });
      router.refresh();
    });
  }

  async function handleToggle(guard, active) {
    start(async () => {
      await setUserActive(guard.id, active);
      setToggleTarget(null);
      router.refresh();
    });
  }

  return (
    <div>
      <PageHeader
        title="Guards & Rovers"
        subtitle={`${guards.length} team member${guards.length !== 1 ? "s" : ""}`}
        action={canManage && (
          <button onClick={() => setInviteOpen(true)} className="btn-primary">
            <UserPlus size={16} /> Invite guard
          </button>
        )}
      />

      {guards.length > 0 ? (
        <div className="table-wrapper mt-4">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th>{canManage && <th></th>}</tr>
            </thead>
            <tbody>
              {guards.map((g) => (
                <tr key={g.id}>
                  <td className="font-medium text-white">{g.full_name || "--"}</td>
                  <td className="text-slate-400">{g.email}</td>
                  <td className="text-slate-400">{g.phone || "--"}</td>
                  <td><RoleBadge role={g.role} /></td>
                  <td>
                    <span className={g.is_active ? "badge-green" : "badge-slate"}>
                      {g.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td><RelativeTime date={g.created_at} /></td>
                  {canManage && (
                    <td>
                      <button
                        onClick={() => setToggleTarget({ guard: g, activate: !g.is_active })}
                        className={`btn-ghost btn-sm ${g.is_active ? "hover:text-red-400" : "hover:text-green-400"}`}
                        title={g.is_active ? "Deactivate" : "Activate"}
                      >
                        {g.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Users} title="No guards yet"
          body="Invite your first guard to get started."
          action={canManage && (
            <button onClick={() => setInviteOpen(true)} className="btn-primary">
              <UserPlus size={16} /> Invite guard
            </button>
          )}
        />
      )}

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite guard or rover">
        <div className="space-y-4">
          {feedback && <p className="text-sm text-red-400">{feedback}</p>}
          <div>
            <label className="label">Full name *</label>
            <input value={form.full_name} onChange={set("full_name")} className="input" placeholder="Maria Santos" />
            {errors.full_name && <p className="field-error">{errors.full_name}</p>}
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.email} onChange={set("email")} className="input" placeholder="guard@company.com" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={set("role")} className="input">
              <option value="guard">Guard</option>
              <option value="rover">Rover</option>
            </select>
          </div>
          <p className="text-xs text-slate-500">
            An invitation email will be sent. The guard sets their own password on first login.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setInviteOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleInvite} disabled={isPending} className="btn-primary">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Send invite
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => handleToggle(toggleTarget.guard, toggleTarget.activate)}
        danger={!toggleTarget?.activate}
        title={toggleTarget?.activate ? "Activate user" : "Deactivate user"}
        body={`${toggleTarget?.activate ? "Restore access for" : "Remove access for"} ${toggleTarget?.guard.full_name || toggleTarget?.guard.email}?`}
        confirmLabel={toggleTarget?.activate ? "Activate" : "Deactivate"}
      />
    </div>
  );
}
