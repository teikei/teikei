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
export const toEmailCampaign = serializer('EmailCampaign', 'email-campaigns')
export const toEmailMessage = serializer('EmailMessage', 'email-messages')

// The inverse of the serializers, for create and patch data: clients send back
// the records they read, with the `type` and `link` added here, and the
// database assigns ids, so none of them reaches the domain.
const SERVER_FIELDS = ['id', 'type', 'link']

export const fromRequest = <T extends object>(data: T) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => !SERVER_FIELDS.includes(key))
  ) as Omit<T, 'id' | 'type' | 'link'>

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

// Roles and admin origins are records on the account reads, and ids or
// records in admin/users.
export const toUser = <R extends Row>(row: R): Serialized<R, 'User'> =>
  withNested(toOwner(row), { roles: toRole, adminOrigins: toOrigin })

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
