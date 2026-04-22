"use client";

import { X, Loader2 } from "lucide-react";

/* ---- Severity badge ---- */
const SEVERITY_STYLES = {
  low:      "badge-green",
  medium:   "badge-yellow",
  high:     "badge-orange",
  critical: "badge-red",
};

export function SeverityBadge({ severity }) {
  return (
    <span className={SEVERITY_STYLES[severity] || "badge-slate"}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
    </span>
  );
}

/* ---- Incident status badge ---- */
const STATUS_STYLES = {
  draft:       "badge-slate",
  open:        "badge-blue",
  in_progress: "badge-yellow",
  resolved:    "badge-green",
  closed:      "badge-slate",
};

const STATUS_LABELS = {
  draft:       "Draft",
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

export function StatusBadge({ status }) {
  return (
    <span className={STATUS_STYLES[status] || "badge-slate"}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ---- Role badge ---- */
const ROLE_STYLES = {
  super_admin: "badge-blue",
  management:  "badge-blue",
  supervisor:  "badge-yellow",
  guard:       "badge-slate",
  rover:       "badge-slate",
};

export function RoleBadge({ role }) {
  const label = role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={ROLE_STYLES[role] || "badge-slate"}>{label}</span>;
}

/* ---- Check-in type badge ---- */
const CHECKIN_STYLES = {
  shift_start:  "badge-green",
  shift_end:    "badge-slate",
  patrol:       "badge-blue",
  break_start:  "badge-yellow",
  break_end:    "badge-green",
};

const CHECKIN_LABELS = {
  shift_start:  "Shift Start",
  shift_end:    "Shift End",
  patrol:       "Patrol",
  break_start:  "Break Start",
  break_end:    "Break End",
};

export function CheckInBadge({ type }) {
  return (
    <span className={CHECKIN_STYLES[type] || "badge-slate"}>
      {CHECKIN_LABELS[type] || type}
    </span>
  );
}

/* ---- Empty state ---- */
export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" />}
      <p className="empty-state-title">{title}</p>
      {body && <p className="empty-state-body mt-1">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---- Spinner ---- */
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-blue-400" />;
}

/* ---- Modal ---- */
export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-slate-900 border border-slate-700
        rounded-2xl shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---- Confirm dialog ---- */
export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger = false }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-slate-400 text-sm mb-6">{body}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={danger ? "btn-danger" : "btn-primary"}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* ---- Page header wrapper ---- */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ---- Stat card ---- */
export function StatCard({ label, value, icon: Icon, trend, color = "blue" }) {
  const colorMap = {
    blue:   "text-blue-400 bg-blue-500/10",
    green:  "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    red:    "text-red-400 bg-red-500/10",
    slate:  "text-slate-400 bg-slate-700",
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        {Icon && (
          <span className={`p-2 rounded-lg ${colorMap[color]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <span className="text-3xl font-semibold text-white">{value}</span>
      {trend && <span className="text-xs text-slate-500">{trend}</span>}
    </div>
  );
}

/* ---- Relative time helper ---- */
export function RelativeTime({ date }) {
  if (!date) return <span className="text-slate-500">--</span>;
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  let label;
  if (minutes < 1)      label = "Just now";
  else if (minutes < 60) label = `${minutes}m ago`;
  else if (hours < 24)   label = `${hours}h ago`;
  else if (days < 7)     label = `${days}d ago`;
  else                   label = d.toLocaleDateString();

  return (
    <span title={d.toLocaleString()} className="text-slate-400 text-sm">
      {label}
    </span>
  );
}
