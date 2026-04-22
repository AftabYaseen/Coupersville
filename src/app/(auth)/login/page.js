import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign In | FairGround",
};

export default function LoginPage({ searchParams }) {
  return (
    <div className="auth-card">
      <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
      <p className="text-slate-400 text-sm mb-8">
        Sign in to your FairGround account.
      </p>
      <LoginForm next={searchParams?.next} />
      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
          Register your company
        </a>
      </p>
    </div>
  );
}
