import ForgotForm from "./ForgotForm";

export const metadata = {
  title: "Reset Password | FairGround",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-card">
      <h1 className="text-2xl font-semibold text-white mb-1">Reset your password</h1>
      <p className="text-slate-400 text-sm mb-8">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <ForgotForm />
      <p className="text-center text-sm text-slate-500 mt-6">
        <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          Back to sign in
        </a>
      </p>
    </div>
  );
}
