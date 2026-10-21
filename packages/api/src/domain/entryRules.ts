import type { AdminFilters } from '../repositories/entries.ts'

// Rules shared by the farm, depot and initiative domains.

// `type` and `link` come back from clients that send a record they read, and
// the database always assigns the id, so none of them is written.
const SERVER_FIELDS = ['id', 'type', 'link']

export const withoutServerFields = <T extends object>(input: T) =>
  Object.fromEntries(
    Object.entries(input).filter(([key]) => !SERVER_FIELDS.includes(key))
  ) as Omit<T, 'id' | 'type' | 'link'>

// A write answers with the full records of the relations it was given, like
// the relate hooks did.
export const writtenRelations = <E extends object>(
  entry: E,
  relations: Partial<Record<keyof E, unknown>>
) =>
  Object.fromEntries(
    Object.entries(relations)
      .filter(([, ids]) => ids)
      .map(([key]) => [key, entry[key as keyof E]])
  ) as Partial<E>

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
