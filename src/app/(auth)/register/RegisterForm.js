"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Building2, User } from "lucide-react";
import { BUSINESS_TYPES } from "@/lib/validators";

const STEPS = ["company", "account"];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm]         = useState({
    company_name:  "",
    business_type: "",
    service_type:  "",
    full_name:     "",
    email:         "",
    password:      "",
    confirm:       "",
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validateStep0() {
    if (!form.company_name.trim()) return "Company name is required.";
    if (!form.business_type)       return "Please select a business type.";
    return null;
  }

  function validateStep1() {
    if (!form.full_name.trim()) return "Your full name is required.";
    if (!form.email.trim())     return "Email is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  }

  function nextStep(e) {
    e.preventDefault();
    const err = validateStep0();
    if (err) { setError(err); return; }
    setError("");
    setStep(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Create the company row first
      const { data: company, error: companyErr } = await supabase
        .from("companies")
        .insert({
          company_name:  form.company_name.trim(),
          business_type: form.business_type,
          service_type:  form.service_type.trim() || null,
        })
        .select("id")
        .single();

      if (companyErr) throw companyErr;

      // 2. Sign up the user, passing company_id and role in metadata
      //    The on_auth_user_created trigger will read these and create the profile
      const { error: signUpErr } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name:  form.full_name.trim(),
            role:       "management",
            company_id: company.id,
          },
          emailRedirectTo: `${window.location.origin}/accept-invite`,
        },
      });

      if (signUpErr) {
        // Roll back the company we just created
        await supabase.from("companies").delete().eq("id", company.id);
        throw signUpErr;
      }

      router.push("/login?registered=1");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                ${i <= step ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i <= step ? "text-slate-300" : "text-slate-600"}`}>
              {i === 0 ? "Company" : "Your account"}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-blue-600" : "bg-slate-800"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={nextStep} className="space-y-5">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Building2 size={16} />
            <span className="text-sm font-medium">Company details</span>
          </div>

          <div>
            <label htmlFor="company_name" className="label">Company name</label>
            <input
              id="company_name"
              type="text"
              required
              value={form.company_name}
              onChange={set("company_name")}
              className="input"
              placeholder="Apex Security Group"
            />
          </div>

          <div>
            <label htmlFor="business_type" className="label">Business type</label>
            <select
              id="business_type"
              required
              value={form.business_type}
              onChange={set("business_type")}
              className="input"
            >
              <option value="">Select a type...</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service_type" className="label">
              Service type{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="service_type"
              type="text"
              value={form.service_type}
              onChange={set("service_type")}
              className="input"
              placeholder="e.g. Commercial and residential security"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full btn-lg">
            Continue
          </button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <User size={16} />
            <span className="text-sm font-medium">Your administrator account</span>
          </div>

          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input
              id="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={set("full_name")}
              className="input"
              placeholder="Sarah Mitchell"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              className="input"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              className="input"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="label">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              className="input"
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setError(""); setStep(0); }}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 btn-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
