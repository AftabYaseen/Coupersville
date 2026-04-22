import { redirect } from "next/navigation";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MANAGEMENT: "management",
  SUPERVISOR: "supervisor",
  GUARD: "guard",
  ROVER: "rover",
};

const ROLE_HIERARCHY = {
  super_admin: 5,
  management: 4,
  supervisor: 3,
  guard: 2,
  rover: 2,
};

export function hasRole(profile, ...roles) {
  return roles.includes(profile.role);
}

export function hasMinRole(profile, minRole) {
  return (ROLE_HIERARCHY[profile.role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

/**
 * Call in Server Components to enforce role.
 * Redirects to /dashboard if the user lacks the required role.
 */
export function requireRole(profile, ...roles) {
  if (!hasRole(profile, ...roles)) {
    redirect("/dashboard");
  }
}

export function requireMinRole(profile, minRole) {
  if (!hasMinRole(profile, minRole)) {
    redirect("/dashboard");
  }
}

export function isManagementOrAbove(profile) {
  return hasMinRole(profile, ROLES.MANAGEMENT);
}

export function isSuperAdmin(profile) {
  return profile.role === ROLES.SUPER_ADMIN;
}

/**
 * Redirect unauthenticated or wrong-role users from auth pages.
 * Returns the correct post-login destination for a given role.
 */
export function dashboardPathForRole(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/super-admin";
    case ROLES.MANAGEMENT:
      return "/management-dashboard";
    case ROLES.SUPERVISOR:
      return "/dashboard";
    case ROLES.GUARD:
    case ROLES.ROVER:
    default:
      return "/dashboard";
  }
}
