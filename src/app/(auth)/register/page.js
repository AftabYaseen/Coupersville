import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Register | FairGround",
};

export default function RegisterPage() {
  return (
    <div className="auth-card">
      <h1 className="text-2xl font-semibold text-white mb-1">
        Create your company account
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        Get started with FairGround. You&apos;ll be the first administrator.
      </p>
      <RegisterForm />
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
}
