import {
  LayoutDashboard,
  AlertTriangle,
  LogIn,
  Users,
  UserCheck,
  Building2,
  KeyRound,
  FileBarChart2,
  ActivitySquare,
  Settings,
  UserCog,
  Globe,
  BarChart3,
  Lightbulb,
  CreditCard,
  User,
} from "lucide-react";

export function getNavItems(role) {
  const shared = [
    { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { href: "/incidents",  label: "Incidents",  icon: AlertTriangle },
    { href: "/check-in",   label: "Check In",   icon: LogIn },
    { href: "/profile",    label: "Profile",    icon: User },
  ];

  const managementItems = [
    { href: "/management-dashboard", label: "Dashboard",      icon: LayoutDashboard },
    { href: "/incidents",            label: "Incidents",      icon: AlertTriangle },
    { href: "/clients",              label: "Clients",        icon: Building2 },
    { href: "/security-codes",       label: "Security Codes", icon: KeyRound },
    { href: "/guards",               label: "Guards",         icon: Users },
    { href: "/supervisors",          label: "Supervisors",    icon: UserCheck },
    { href: "/user-roles",           label: "User Roles",     icon: UserCog },
    { href: "/reports",              label: "Reports",        icon: FileBarChart2 },
    { href: "/activity-logs",        label: "Activity Logs",  icon: ActivitySquare },
    { href: "/company-settings",     label: "Settings",       icon: Settings },
  ];

  const superAdminItems = [
    { href: "/super-admin",              label: "Dashboard",  icon: LayoutDashboard },
    { href: "/super-admin/companies",    label: "Companies",  icon: Globe },
    { href: "/super-admin/users",        label: "All Users",  icon: Users },
    { href: "/super-admin/stats",        label: "Stats",      icon: BarChart3 },
    { href: "/super-admin/suggestions",  label: "Suggestions",icon: Lightbulb },
    { href: "/super-admin/payments",     label: "Payments",   icon: CreditCard },
    { href: "/super-admin/settings",     label: "Settings",   icon: Settings },
  ];

  switch (role) {
    case "super_admin": return superAdminItems;
    case "management":  return managementItems;
    case "supervisor":
      return [
        { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
        { href: "/incidents",  label: "Incidents",  icon: AlertTriangle },
        { href: "/check-in",   label: "Check In",   icon: LogIn },
        { href: "/guards",     label: "My Guards",  icon: Users },
        { href: "/profile",    label: "Profile",    icon: User },
      ];
    default:
      return shared;
  }
}

// Bottom tab bar items (mobile, max 5)
export function getTabItems(role) {
  switch (role) {
    case "management":
      return [
        { href: "/management-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/incidents",            label: "Incidents", icon: AlertTriangle },
        { href: "/clients",              label: "Clients",   icon: Building2 },
        { href: "/guards",               label: "Guards",    icon: Users },
        { href: "/company-settings",     label: "Settings",  icon: Settings },
      ];
    case "super_admin":
      return [
        { href: "/super-admin",           label: "Dashboard", icon: LayoutDashboard },
        { href: "/super-admin/companies", label: "Companies", icon: Globe },
        { href: "/super-admin/users",     label: "Users",     icon: Users },
        { href: "/super-admin/stats",     label: "Stats",     icon: BarChart3 },
        { href: "/super-admin/settings",  label: "Settings",  icon: Settings },
      ];
    default:
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/incidents", label: "Incidents", icon: AlertTriangle },
        { href: "/check-in",  label: "Check In",  icon: LogIn },
        { href: "/profile",   label: "Profile",   icon: User },
      ];
  }
}
