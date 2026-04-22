"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Loader2 } from "lucide-react";
import { RoleBadge, EmptyState, PageHeader } from "@/components/ui";
import { changeUserRole } from "../guards/actions";
import { USER_ROLES } from "@/lib/validators";

export default function UserRolesClient({ users }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [saving, setSaving] = useState(null);

  async function handleRoleChange(userId, newRole) {
    setSaving(userId);
    start(async () => {
      await changeUserRole(userId, newRole);
      router.refresh();
      setSaving(null);
    });
  }

  return (
    <div>
      <PageHeader
        title="User Roles"
        subtitle="Change role assignments for your company members."
      />

      {users.length > 0 ? (
        <div className="table-wrapper mt-4">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Current role</th><th>Change role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-white">{u.full_name || "--"}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={saving === u.id || isPending}
                        className="input w-auto text-sm py-1"
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      {saving === u.id && (
                        <Loader2 size={14} className="animate-spin text-blue-400" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={u.is_active ? "badge-green" : "badge-slate"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={UserCog} title="No other users" body="Invite guards and supervisors first." />
      )}
    </div>
  );
}
