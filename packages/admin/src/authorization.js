const SUPERADMIN = "superadmin";
const ADMIN = "admin";

const hasRole = (permissions, permission) =>
  permissions && permissions.includes(permission);

export const hasSuperAdminRole = (permissions) =>
  hasRole(permissions, SUPERADMIN);
export const hasAdminRole = (permissions) =>
  hasRole(permissions, SUPERADMIN) || hasRole(permissions, ADMIN);
