import AcceptInviteForm from "./AcceptInviteForm";

export const metadata = {
  title: "Set Your Password | FairGround",
};

export default function AcceptInvitePage() {
  return (
    <div className="auth-card">
      <h1 className="text-2xl font-semibold text-white mb-1">Set your password</h1>
      <p className="text-slate-400 text-sm mb-8">
        Choose a password for your FairGround account.
      </p>
      <AcceptInviteForm />
    </div>
  );
}
