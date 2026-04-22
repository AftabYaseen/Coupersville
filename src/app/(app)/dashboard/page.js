import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  LogIn,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import {
  StatCard,
  StatusBadge,
  SeverityBadge,
  CheckInBadge,
  RelativeTime,
  EmptyState,
  PageHeader,
} from "@/components/ui";

export const metadata = { title: "Dashboard | FairGround" };

export default async function DashboardPage() {
  const { profile } = await requireAuth();

  // Management and super_admin go to their own dashboards
  if (profile.role === "management") redirect("/management-dashboard");
  if (profile.role === "super_admin") redirect("/super-admin");

  const supabase = await createClient();
  const today    = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's check-ins for this user
  const { data: todayCheckins } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", profile.id)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  // Last 5 incidents reported by this user
  const { data: myIncidents } = await supabase
    .from("incidents")
    .select("id, title, status, severity, created_at, category")
    .eq("reported_by", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Derive shift state from today's check-ins
  const lastCheckin   = todayCheckins?.[0];
  const onShift       = lastCheckin?.check_in_type === "shift_start" ||
                        lastCheckin?.check_in_type === "patrol" ||
                        lastCheckin?.check_in_type === "break_end";
  const onBreak       = lastCheckin?.check_in_type === "break_start";
  const shiftEnded    = lastCheckin?.check_in_type === "shift_end";
  const shiftStarted  = todayCheckins?.some((c) => c.check_in_type === "shift_start");

  const openIncidents = myIncidents?.filter(
    (i) => !["resolved", "closed", "draft"].includes(i.status)
  ).length ?? 0;

  const draftCount = myIncidents?.filter((i) => i.status === "draft").length ?? 0;

  return (
    <div>
      <PageHeader
        title={`Good ${greeting()}, ${firstName(profile.full_name)}`}
        subtitle={today.toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
      />

      {/* Shift status banner */}
      <ShiftBanner
        onShift={onShift}
        onBreak={onBreak}
        shiftEnded={shiftEnded}
        shiftStarted={shiftStarted}
        lastCheckin={lastCheckin}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Check-ins today"
          value={todayCheckins?.length ?? 0}
          icon={LogIn}
          color="blue"
        />
        <StatCard
          label="Open incidents"
          value={openIncidents}
          icon={AlertTriangle}
          color={openIncidents > 0 ? "yellow" : "slate"}
        />
        <StatCard
          label="Draft incidents"
          value={draftCount}
          icon={Clock}
          color={draftCount > 0 ? "red" : "slate"}
        />
        <StatCard
          label="Total filed"
          value={myIncidents?.length ?? 0}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link href="/check-in" className="card flex items-center gap-4 hover:border-blue-600/50
          transition-colors group">
          <span className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
            <LogIn size={22} />
          </span>
          <div>
            <p className="font-medium text-white">Check In / Out</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {onShift ? "You are currently on shift" :
               onBreak ? "You are on a break" :
               shiftEnded ? "Shift ended today" :
               "Start your shift"}
            </p>
          </div>
        </Link>

        <Link href="/incidents/new" className="card flex items-center gap-4 hover:border-red-600/50
          transition-colors group">
          <span className="p-3 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
            <AlertTriangle size={22} />
          </span>
          <div>
            <p className="font-medium text-white">Report Incident</p>
            <p className="text-sm text-slate-400 mt-0.5">File a new incident report</p>
          </div>
        </Link>
      </div>

      {/* Today's check-in timeline */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Today&apos;s activity</h2>
          <Link href="/check-in" className="text-xs text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        {todayCheckins && todayCheckins.length > 0 ? (
          <ol className="relative border-l border-slate-800 ml-3 space-y-4">
            {todayCheckins.map((c) => (
              <li key={c.id} className="ml-5">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-900" />
                <div className="flex items-center gap-3">
                  <CheckInBadge type={c.check_in_type} />
                  <span className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {c.location?.address && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={10} />
                      {c.location.address}
                    </span>
                  )}
                </div>
                {c.notes && (
                  <p className="text-xs text-slate-500 mt-1">{c.notes}</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={LogIn}
            title="No check-ins today"
            body="Start your shift to log your first check-in."
          />
        )}
      </div>

      {/* Recent incidents */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">My recent incidents</h2>
          <Link href="/incidents" className="text-xs text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        {myIncidents && myIncidents.length > 0 ? (
          <div className="space-y-3">
            {myIncidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-start justify-between gap-4 p-3 rounded-lg
                  bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{inc.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {inc.category?.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge status={inc.status} />
                  <RelativeTime date={inc.created_at} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="No incidents filed yet"
            body="Tap Report Incident when something needs documenting."
          />
        )}
      </div>
    </div>
  );
}

/* ---- Helpers ---- */

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function firstName(fullName) {
  return fullName?.split(" ")[0] || "there";
}

function ShiftBanner({ onShift, onBreak, shiftEnded, shiftStarted, lastCheckin }) {
  if (onShift) {
    return (
      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
        bg-green-500/10 border border-green-500/20">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        <p className="text-sm text-green-300 font-medium">
          Shift active
          {lastCheckin?.created_at && (
            <span className="font-normal text-green-400/70 ml-2">
              since {new Date(lastCheckin.created_at).toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          )}
        </p>
        <Link href="/check-in" className="ml-auto text-xs text-green-400 hover:text-green-300">
          Manage shift
        </Link>
      </div>
    );
  }
  if (onBreak) {
    return (
      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
        bg-yellow-500/10 border border-yellow-500/20">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
        <p className="text-sm text-yellow-300 font-medium">On break</p>
        <Link href="/check-in" className="ml-auto text-xs text-yellow-400 hover:text-yellow-300">
          End break
        </Link>
      </div>
    );
  }
  if (shiftEnded) {
    return (
      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
        bg-slate-800 border border-slate-700">
        <CheckCircle2 size={16} className="text-slate-400" />
        <p className="text-sm text-slate-400">Shift completed for today.</p>
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
      bg-blue-500/10 border border-blue-500/20">
      <XCircle size={16} className="text-blue-400" />
      <p className="text-sm text-blue-300 font-medium">No active shift</p>
      <Link href="/check-in" className="ml-auto text-xs text-blue-400 hover:text-blue-300">
        Start shift
      </Link>
    </div>
  );
}
