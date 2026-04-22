"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn, LogOut, Coffee, PlayCircle,
  Navigation, MapPin, Loader2, CheckCircle2,
} from "lucide-react";
import { CheckInBadge, RelativeTime, PageHeader } from "@/components/ui";
import { submitCheckIn } from "./actions";

export default function CheckInClient({ profile, todayCheckins, clients }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const [locating, setLocating]   = useState(false);
  const [location, setLocation]   = useState(null);
  const [locError, setLocError]   = useState("");
  const [notes, setNotes]         = useState("");
  const [clientId, setClientId]   = useState("");
  const [feedback, setFeedback]   = useState(null);

  // Derive shift state
  const last        = todayCheckins[0];
  const onShift     = last?.check_in_type === "shift_start"
                   || last?.check_in_type === "patrol"
                   || last?.check_in_type === "break_end";
  const onBreak     = last?.check_in_type === "break_start";
  const shiftEnded  = last?.check_in_type === "shift_end";

  async function getLocation() {
    setLocError("");
    setLocating(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocError("Geolocation is not supported by this browser.");
        setLocating(false);
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat:      pos.coords.latitude,
            lng:      pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          };
          setLocation(loc);
          setLocating(false);
          resolve(loc);
        },
        (err) => {
          setLocError("Could not get location: " + err.message);
          setLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleCheckIn(type) {
    const loc = location || (await getLocation());
    start(async () => {
      const result = await submitCheckIn({
        type,
        location: loc,
        notes:    notes.trim() || null,
        clientId: clientId || null,
        userId:   profile.id,
        companyId: profile.company_id,
      });
      if (result.error) {
        setFeedback({ ok: false, message: result.error });
      } else {
        setFeedback({ ok: true, message: checkInLabel(type) + " recorded." });
        setNotes("");
        router.refresh();
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Check In"
        subtitle="Log your shift status and location."
      />

      {/* Location card */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Your location</h2>
          <button
            onClick={getLocation}
            disabled={locating}
            className="btn-ghost btn-sm flex items-center gap-1.5"
          >
            {locating
              ? <><Loader2 size={13} className="animate-spin" />Locating...</>
              : <><Navigation size={13} />Get location</>}
          </button>
        </div>

        {location ? (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <MapPin size={14} />
            <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
            <span className="text-slate-500 text-xs">(±{location.accuracy}m)</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {locError || "Location not captured yet. Tap Get location or it will be captured on check-in."}
          </p>
        )}
      </div>

      {/* Client & notes */}
      <div className="card mb-5 space-y-4">
        <div>
          <label className="label">Site / Client (optional)</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="input"
          >
            <option value="">No specific site</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.client_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Any notes for this check-in..."
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Shift actions</h2>

        {feedback && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm
            ${feedback.ok
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
            {feedback.ok && <CheckCircle2 size={14} />}
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Start shift */}
          {!shiftEnded && !onShift && !onBreak && (
            <ActionBtn
              icon={LogIn}
              label="Start Shift"
              color="green"
              loading={isPending}
              onClick={() => handleCheckIn("shift_start")}
            />
          )}

          {/* End shift */}
          {(onShift || onBreak) && (
            <ActionBtn
              icon={LogOut}
              label="End Shift"
              color="red"
              loading={isPending}
              onClick={() => handleCheckIn("shift_end")}
            />
          )}

          {/* Start break */}
          {onShift && (
            <ActionBtn
              icon={Coffee}
              label="Start Break"
              color="yellow"
              loading={isPending}
              onClick={() => handleCheckIn("break_start")}
            />
          )}

          {/* End break */}
          {onBreak && (
            <ActionBtn
              icon={PlayCircle}
              label="End Break"
              color="blue"
              loading={isPending}
              onClick={() => handleCheckIn("break_end")}
            />
          )}

          {/* Patrol log */}
          {onShift && (
            <ActionBtn
              icon={Navigation}
              label="Log Patrol"
              color="blue"
              loading={isPending}
              onClick={() => handleCheckIn("patrol")}
            />
          )}
        </div>

        {shiftEnded && (
          <p className="text-center text-sm text-slate-400 mt-4">
            Your shift has ended for today.
          </p>
        )}
      </div>

      {/* Today's timeline */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">
          Today&apos;s log
          <span className="ml-2 text-slate-500 font-normal">
            ({todayCheckins.length} entries)
          </span>
        </h2>

        {todayCheckins.length > 0 ? (
          <ol className="relative border-l border-slate-800 ml-3 space-y-5">
            {todayCheckins.map((c) => (
              <li key={c.id} className="ml-5">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-slate-700
                  border-2 border-slate-900 mt-0.5" />
                <div className="flex flex-wrap items-center gap-2">
                  <CheckInBadge type={c.check_in_type} />
                  <span className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {c.clients?.client_name && (
                    <span className="text-xs text-slate-500">
                      @ {c.clients.client_name}
                    </span>
                  )}
                </div>
                {c.location && (
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <MapPin size={9} />
                    {c.location.lat?.toFixed(4)}, {c.location.lng?.toFixed(4)}
                    {c.location.accuracy && ` (±${c.location.accuracy}m)`}
                  </p>
                )}
                {c.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">{c.notes}</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">
            No check-ins recorded today.
          </p>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, loading, onClick }) {
  const colors = {
    green:  "bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20",
    red:    "bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20",
    yellow: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20",
    blue:   "bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-colors
        font-medium text-sm disabled:opacity-50 ${colors[color]}`}
    >
      {loading
        ? <Loader2 size={22} className="animate-spin" />
        : <Icon size={22} />}
      {label}
    </button>
  );
}

function checkInLabel(type) {
  const m = {
    shift_start: "Shift started",
    shift_end:   "Shift ended",
    patrol:      "Patrol logged",
    break_start: "Break started",
    break_end:   "Break ended",
  };
  return m[type] || type;
}
