import "@/app/app.css";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg
            width="32"
            height="32"
            viewBox="0 0 28 28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 4h20v3H7v5h13v3H7v9H4z" fill="#f1f5f9" />
            <circle cx="21" cy="7" r="2.5" fill="#3b82f6" />
          </svg>
          <span className="text-white font-semibold text-xl tracking-tight">
            FairGround
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
