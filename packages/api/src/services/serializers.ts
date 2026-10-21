// Adds the `type` and `link` that the Objection models had as virtual
// attributes, to every record a service returns, nested ones included.

type Row = { id: string }

type Serialized<R, T extends string> = R & { type: T; link: string }

const serializer =
  <T extends string>(type: T, path: string) =>
  <R extends Row>(row: R): Serialized<R, T> => ({
    ...row,
    type,
    link: `/${path}/${row.id}`
  })

export const toProduct = serializer('Product', 'products')
export const toBadge = serializer('Badge', 'badges')
export const toGoal = serializer('Goal', 'goals')
export const toOrigin = serializer('Origin', 'origins')
export const toRole = serializer('Role', 'roles')
export const toOwner = serializer('User', 'users')

export const toPage = <R, T>(
  page: { total: number; limit: number; skip: number; data: R[] },
  serialize: (row: R) => T
) => ({ ...page, data: page.data.map(serialize) })

// Nested relations are records, or ids in the admin's default shape.
const withNested = <R extends object>(
  record: R,
  nested: Record<string, (row: Row) => unknown>
) => {
  const result = { ...record } as Record<string, unknown>
  for (const [key, serialize] of Object.entries(nested)) {
    const value = result[key]
    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' ? serialize(item) : item
      )
    }
  }
  return result as R
}

const farm = serializer('Farm', 'farms')
const depot = serializer('Depot', 'depots')
const initiative = serializer('Initiative', 'initiatives')

export const toFarm = <R extends Row>(row: R): Serialized<R, 'Farm'> =>
  withNested(farm(row), {
    products: toProduct,
    depots: toDepot,
    badges: toBadge,
    ownerships: toOwner
  })

export const toDepot = <R extends Row>(row: R): Serialized<R, 'Depot'> =>
  withNested(depot(row), { farms: toFarm, ownerships: toOwner })

export const toInitiative = <R extends Row>(
  row: R
): Serialized<R, 'Initiative'> =>
  withNested(initiative(row), {
    goals: toGoal,
    badges: toBadge,
    ownerships: toOwner
  })
