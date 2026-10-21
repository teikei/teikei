import type { Query } from '@feathersjs/feathers'
import type {
  Badges,
  Depots,
  Farms,
  Initiatives,
  Products
} from '../db/types.ts'

// Column lists shared by the farm, depot and initiative repositories.

// The columns farms, depots and initiatives share.
export const ENTRY_COLUMNS = [
  'id',
  'name',
  'address',
  'street',
  'housenumber',
  'postalcode',
  'city',
  'state',
  'country',
  'latitude',
  'longitude',
  'createdAt',
  'updatedAt'
] as const satisfies readonly (keyof Farms & keyof Depots & keyof Initiatives)[]

// Precise location fields that must only be exposed to the entry's owner.
const PRIVATE_ADDRESS_COLUMNS: readonly string[] = [
  'address',
  'street',
  'housenumber'
]

// Columns safe to return on the public, unauthenticated /entries listing. The
// per-resource services re-add the private ones for the owner through
// filterAllowedFields.
export const PUBLIC_ENTRY_COLUMNS = ENTRY_COLUMNS.filter(
  (column) => !PRIVATE_ADDRESS_COLUMNS.includes(column)
)

const ENTRY_DETAIL_COLUMNS = [
  ...ENTRY_COLUMNS,
  'active',
  'description',
  'url'
] as const

export const FARM_COLUMNS = [
  ...ENTRY_DETAIL_COLUMNS,
  'acceptsNewMembers',
  'actsEcological',
  'additionalProductInformation',
  'economicalBehavior',
  'foundedAtMonth',
  'foundedAtYear',
  'maximumMembers',
  'participation'
] as const satisfies readonly (keyof Farms)[]

export const DEPOT_COLUMNS = [
  ...ENTRY_DETAIL_COLUMNS,
  'deliveryDays'
] as const satisfies readonly (keyof Depots)[]

export const INITIATIVE_COLUMNS =
  ENTRY_DETAIL_COLUMNS satisfies readonly (keyof Initiatives)[]

// Depots nested in a public farm carry the extra info fields shown in the farm
// profile's depot accordion; all three are publicly readable.
export const NESTED_DEPOT_COLUMNS = [
  ...ENTRY_COLUMNS,
  'description',
  'deliveryDays',
  'url'
] as const satisfies readonly (keyof Depots)[]

export const PRODUCT_COLUMNS = [
  'id',
  'category',
  'name'
] as const satisfies readonly (keyof Products)[]

export const BADGE_SUMMARY = [
  'id',
  'name',
  'category',
  'url',
  'logo'
] as const satisfies readonly (keyof Badges)[]

export const BADGE_COLUMNS = [...BADGE_SUMMARY, 'country'] as const

// Named admin list filters. The badge filters stay within the admin's origins
// like the Objection modifiers they replace.
export type AdminFilters = {
  withBadge?: string
  withoutBadge?: string
  inOrigins?: string[]
}

export const qualify = <T extends string, C extends string>(
  table: T,
  columns: readonly C[]
) => columns.map((column) => `${table}.${column}` as const)

// The admin lists send q (reference inputs) or name (list filter) for a
// case-insensitive substring match on the name.
export const withNameSearch = ({ q, ...query }: Query): Query => {
  const name = q ?? query.name
  return name === undefined
    ? query
    : { ...query, name: { $ilike: `%${name}%` } }
}
