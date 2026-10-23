import type { AdminFilters } from '../repositories/entries.ts'

// Rules shared by the farm, depot and initiative domains.

export type AdminUser = {
  roles: { name: string }[]
  adminOrigins: { origin: string }[]
}

export type BadgeFilters = { hasBadge?: string; notHasBadge?: string }

// What hasBadge, notHasBadge and the admin's origins restrict an admin list
// to. Superadmins see every origin unless they filter by badge, and internal
// callers (no user) are not restricted.
export const adminFilters = (
  user: AdminUser | undefined,
  { hasBadge, notHasBadge }: BadgeFilters = {}
): AdminFilters => {
  if (!user) {
    return {}
  }
  const inOrigins = user.adminOrigins.map(({ origin }) => origin)
  if (notHasBadge) {
    return { withoutBadge: notHasBadge, inOrigins }
  }
  if (hasBadge) {
    return { withBadge: hasBadge, inOrigins }
  }
  return user.roles.some(({ name }) => name === 'superadmin')
    ? {}
    : { inOrigins }
}
