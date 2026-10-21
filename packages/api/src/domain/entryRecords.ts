import type { AdminFilters } from '../repositories/entries.ts'

// Record shapes and helpers shared by the farm, depot and initiative domains.
// Every record, nested ones included, carries the `type` and `link` that the
// Objection models added as virtual attributes.

type WithId = { id: string }

export const toFarm = <R extends WithId>(row: R) => ({
  ...row,
  type: 'Farm' as const,
  link: `/farms/${row.id}`
})

export const toDepot = <R extends WithId>(row: R) => ({
  ...row,
  type: 'Depot' as const,
  link: `/depots/${row.id}`
})

export const toInitiative = <R extends WithId>(row: R) => ({
  ...row,
  type: 'Initiative' as const,
  link: `/initiatives/${row.id}`
})

export const toOwner = <R extends WithId>(row: R) => ({
  ...row,
  type: 'User' as const,
  link: `/users/${row.id}`
})

// Groups the rows of a relation loader by entry, without their entryId tag.
export const byEntry = <R extends { entryId: string | null }, T>(
  rows: R[],
  toRecord: (row: Omit<R, 'entryId'>) => T
) => {
  const grouped = new Map<string, T[]>()
  for (const { entryId, ...row } of rows) {
    const records = grouped.get(String(entryId)) ?? []
    records.push(toRecord(row))
    grouped.set(String(entryId), records)
  }
  return (id: string) => grouped.get(id) ?? []
}

export const toId = ({ id }: WithId) => id

// Relations are written as lists of related ids.
export type RelationIds = (string | number)[]

// `type` and `link` were Objection virtual attributes, and the database always
// assigns the id, so none of them is written.
const SERVER_FIELDS = ['id', 'type', 'link']

export const withoutServerFields = <T extends object>(input: T) =>
  Object.fromEntries(
    Object.entries(input).filter(([key]) => !SERVER_FIELDS.includes(key))
  ) as Omit<T, 'id' | 'type' | 'link'>

export type AdminUser = {
  roles: { name: string }[]
  adminOrigins: { origin: string }[]
}

// What hasBadge, notHasBadge and the admin's origins restrict an admin list
// to. Superadmins see every origin unless they filter by badge, and internal
// callers (no user) are not restricted.
export const adminFilters = (
  user: AdminUser | undefined,
  { hasBadge, notHasBadge }: { hasBadge?: string; notHasBadge?: string } = {}
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
