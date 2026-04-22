"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNavItems, getTabItems } from "./navConfig";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

export default function AppShell({ profile, children }) {
  const pathname        = usePathname();
  const router          = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = getNavItems(profile.role);
  const tabItems = getTabItems(profile.role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href) {
    if (href === "/dashboard" || href === "/management-dashboard" || href === "/super-admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initials = (profile.full_name || profile.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="app-shell">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="app-sidebar hidden lg:flex">
        <SidebarContent
          profile={profile}
          navItems={navItems}
          isActive={isActive}
          initials={initials}
          onSignOut={signOut}
        />
      </aside>

      {/* ---- Mobile Drawer overlay ---- */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ---- Mobile Drawer ---- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 border-r border-slate-800
          transition-transform duration-300 lg:hidden
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <BrandLogo />
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          profile={profile}
          navItems={navItems}
          isActive={isActive}
          initials={initials}
          onSignOut={signOut}
          hideHeader
        />
      </aside>

      {/* ---- Main area ---- */}
      <div className="app-main flex flex-col min-h-screen">
        {/* Top header (mobile only + breadcrumb) */}
        <header className="sticky top-0 z-30 flex items-center justify-between
          px-4 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur
          lg:px-6 lg:py-4">
          <div className="flex items-center gap-3">
            {/* Hamburger - mobile only */}
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} />
            </button>
            {/* Brand on mobile */}
            <div className="lg:hidden">
              <BrandLogo />
            </div>
          </div>

          {/* Right: user badge */}
          <div className="flex items-center gap-3">
            <RoleBadge role={profile.role} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
                text-xs font-semibold text-white select-none">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-slate-300 max-w-[120px] truncate">
                {profile.full_name || profile.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ---- Mobile Bottom Tab Bar ---- */}
      <nav className="fixed bottom-0 inset-x-0 z-30 flex lg:hidden
        bg-slate-900 border-t border-slate-800">
        {tabItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5
                py-2 text-[10px] font-medium transition-colors
                ${active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ---- Sub-components ---- */

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h20v3H7v5h13v3H7v9H4z" fill="#f1f5f9" />
        <circle cx="21" cy="7" r="2.5" fill="#3b82f6" />
      </svg>
      <span className="text-white font-semibold text-base tracking-tight">FairGround</span>
    </Link>
  );
}

function RoleBadge({ role }) {
  const labels = {
    super_admin: { label: "Super Admin", cls: "badge-blue" },
    management:  { label: "Management",  cls: "badge-blue" },
    supervisor:  { label: "Supervisor",  cls: "badge-yellow" },
    guard:       { label: "Guard",       cls: "badge-slate" },
    rover:       { label: "Rover",       cls: "badge-slate" },
  };
  const { label, cls } = labels[role] || { label: role, cls: "badge-slate" };
  return <span className={cls}><Shield size={10} />{label}</span>;
}

function SidebarContent({ profile, navItems, isActive, initials, onSignOut, hideHeader }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      {!hideHeader && (
        <div className="px-4 py-5 border-b border-slate-800">
          <BrandLogo />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
            text-xs font-semibold text-white flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile.full_name || "Unknown"}
            </p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
