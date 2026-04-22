import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Payments | Super Admin" };

export default async function PaymentsPage() {
  const { profile } = await requireAuth();
  requireRole(profile, "super_admin");

  return (
    <div>
      <PageHeader title="Payments" subtitle="Subscription billing management." />

      <div className="card mt-4 flex flex-col items-center text-center py-16 gap-4 max-w-lg mx-auto">
        <div className="p-4 rounded-2xl bg-slate-800">
          <CreditCard size={32} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Stripe billing coming soon</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
          Subscription management, invoices, and plan upgrades will be handled here
          once Stripe integration is enabled. This is a placeholder for v2.
        </p>
        <div className="mt-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
          <p className="text-xs text-slate-500 font-mono">STRIPE_SECRET_KEY not configured</p>
        </div>
      </div>
    </div>
  );
}
