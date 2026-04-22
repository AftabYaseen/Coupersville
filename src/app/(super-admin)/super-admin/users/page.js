import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { PageHeader, RoleBadge, RelativeTime, EmptyState } from "@/components/ui";

export const metadata = { title: "All Users | Super Admin" };

export default async function SuperAdminUsersPage({ searchParams }) {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  const supabase = await createServiceClient();
  const sp       = await searchParams;
  const search   = sp?.q   || "";
  const roleFilter = sp?.role || "";

  let query = supabase
    .from("profiles")
    .select(`
      id, full_name, email, role, is_active, created_at,
      companies(company_name)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (search)     query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  if (roleFilter) query = query.eq("role", roleFilter);

  const { data: users } = await query;

  return (
    <div>
      <PageHeader title="All Users" subtitle={`${users?.length ?? 0} users (showing up to 200)`} />

      <form className="flex flex-wrap gap-3 mb-4">
        <input name="q" defaultValue={search} className="input w-full max-w-xs" placeholder="Search name or email..." />
        <select name="role" defaultValue={roleFilter} className="input w-auto">
          <option value="">All roles</option>
          {["super_admin","management","supervisor","guard","rover"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
        {(search || roleFilter) && <a href="/super-admin/users" className="btn-ghost">Clear</a>}
      </form>

      {users?.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Company</th><th>Status</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-white">{u.full_name || "--"}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-slate-400">{u.companies?.company_name || "--"}</td>
                  <td><span className={u.is_active ? "badge-green" : "badge-slate"}>{u.is_active ? "Active" : "Inactive"}</span></td>
                  <td><RelativeTime date={u.created_at} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Users} title="No users found" body="Try adjusting your search or filters." />
      )}
    </div>
  );
}
