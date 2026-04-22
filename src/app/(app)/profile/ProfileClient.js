"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { RoleBadge, PageHeader } from "@/components/ui";
import { updateProfile, updatePassword } from "./actions";

export default function ProfileClient({ profile }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();
  const fileRef            = useRef(null);

  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    phone:     profile.phone     || "",
  });
  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || null);
  const [feedback, setFeedback]       = useState(null);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwFeedback, setPwFeedback]   = useState(null);
  const [pwPending, startPw]          = useTransition();

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    start(async () => {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        fd.append("userId", profile.id);
        const res  = await fetch("/api/upload-avatar", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) avatarUrl = json.url;
      }

      const result = await updateProfile({
        full_name:  form.full_name.trim(),
        phone:      form.phone.trim() || null,
        avatar_url: avatarUrl,
      });

      if (result.error) {
        setFeedback({ ok: false, message: result.error });
      } else {
        setFeedback({ ok: true, message: "Profile saved." });
        router.refresh();
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (pwForm.next.length < 8) {
      setPwFeedback({ ok: false, message: "New password must be at least 8 characters." });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwFeedback({ ok: false, message: "Passwords do not match." });
      return;
    }
    startPw(async () => {
      const result = await updatePassword(pwForm.next);
      if (result.error) {
        setPwFeedback({ ok: false, message: result.error });
      } else {
        setPwFeedback({ ok: true, message: "Password updated." });
        setPwForm({ current: "", next: "", confirm: "" });
      }
      setTimeout(() => setPwFeedback(null), 3000);
    });
  }

  const initials = (profile.full_name || profile.email || "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="My Profile" subtitle="Manage your account details." />

      {/* Avatar + role */}
      <div className="card mb-5 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center
              justify-center text-2xl font-bold text-white select-none">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-700
              border-2 border-slate-900 flex items-center justify-center
              text-slate-300 hover:text-white transition-colors"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">
            {profile.full_name || "No name set"}
          </p>
          <p className="text-slate-400 text-sm">{profile.email}</p>
          <div className="mt-1.5">
            <RoleBadge role={profile.role} />
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileSave} className="card mb-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Personal details</h2>

        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={set("full_name")}
            className="input"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="input opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Email cannot be changed here.
          </p>
        </div>

        <div>
          <label className="label">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            className="input"
            placeholder="Your phone number"
          />
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

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending
            ? <><Loader2 size={14} className="animate-spin" />Saving...</>
            : "Save profile"
          }
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordChange} className="card space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">Change password</h2>
        </div>

        <div>
          <label className="label">New password</label>
          <input
            type="password"
            value={pwForm.next}
            onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
            className="input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
            className="input"
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
        </div>

        {pwFeedback && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg
            ${pwFeedback.ok
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
            {pwFeedback.ok && <CheckCircle2 size={14} />}
            {pwFeedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={pwPending}
          className="btn-secondary w-full"
        >
          {pwPending
            ? <><Loader2 size={14} className="animate-spin" />Updating...</>
            : "Update password"
          }
        </button>
      </form>
    </div>
  );
}
