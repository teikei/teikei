import type { Application } from '@feathersjs/feathers'
import { withFeathersErrors } from './db/errors.ts'
import type { Database } from './db/kysely.ts'
import { createDepotsDomain } from './domain/depots.ts'
import { createFarmsDomain } from './domain/farms.ts'
import { createInitiativesDomain } from './domain/initiatives.ts'

export type Role = 'guest' | 'user' | 'admin' | 'superadmin'

// Unset for guests.
type UserId = string | undefined

// What authorize loads for a scope with a condition or fields: entries come
// from the domains' getForAuthorization, users from the users service.
export type EntryResource = {
  id: string
  active: boolean
  ownerships: { id: string | null }[]
}
export type UserResource = { id: string }

export type Scope = {
  scope: string
  // Without an id (find, create) authorize loads no resource. Method syntax
  // lets each condition take the record its own scopes load.
  condition?(
    userId: UserId,
    resource: EntryResource | UserResource | undefined,
    app: Application
  ): boolean | Promise<boolean>
  fields?(userId: UserId, resource?: EntryResource | UserResource): string[]
}

const WRITABLE_DEPOT_FIELDS = [
  'id',
  'name',
  'postalcode',
  'city',
  'state',
  'country',
  'latitude',
  'longitude',
  'description',
  'url',
  'farms',
  'deliveryDays'
]
const READABLE_DEPOT_FIELDS = [
  ...WRITABLE_DEPOT_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt'
]

const WRITABLE_FARM_FIELDS = [
  'id',
  'name',
  'postalcode',
  'city',
  'state',
  'country',
  'latitude',
  'longitude',
  'description',
  'url',
  'depots',
  'acceptsNewMembers',
  'foundedAtYear',
  'foundedAtMonth',
  'maximumMembers',
  'additionalProductInformation',
  'participation',
  'actsEcological',
  'economicalBehavior',
  'products',
  'badges'
]
const READABLE_FARM_FIELDS = [
  ...WRITABLE_FARM_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt'
]

const WRITABLE_INITIATIVE_FIELDS = [
  'id',
  'name',
  'postalcode',
  'city',
  'state',
  'country',
  'latitude',
  'longitude',
  'description',
  'url',
  'goals',
  'badges'
]
const READABLE_INITIATIVE_FIELDS = [
  ...WRITABLE_INITIATIVE_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt'
]

const isOwnedByCurrentUser = (userId: UserId, resource: EntryResource) =>
  resource.ownerships.some((o) => o.id === userId)

const isActiveAndOwnedByCurrentUser = (
  userId: UserId,
  resource: EntryResource
) => {
  return resource.active && isOwnedByCurrentUser(userId, resource)
}

const isUserRecordOfCurrentUser = (userId: UserId, resource: UserResource) =>
  userId === resource.id

const farmReadable = (userId: UserId, resource?: EntryResource) => {
  const fields = [...READABLE_FARM_FIELDS]
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address', 'street', 'housenumber')
  }
  return fields
}

const depotReadable = (userId: UserId, resource?: EntryResource) => {
  const fields = [...READABLE_DEPOT_FIELDS]
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address', 'street', 'housenumber')
  }
  return fields
}

const initiativeReadable = (userId: UserId, resource?: EntryResource) => {
  const fields = [...READABLE_INITIATIVE_FIELDS]
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address', 'street', 'housenumber')
  }
  return fields
}

// The admin create scopes carry these conditions too, but a create has no
// resource, so they throw; kept as is until the admin permissions are revisited.
// Conditions run in the authorize hook, outside the service's error hooks, so
// they map database errors themselves.
type OriginScopedDomain = (db: Database) => {
  isInAdminOrigins(id: string, userId: string): Promise<boolean>
}

const adminHasOriginPermission =
  (createDomain: OriginScopedDomain) =>
  async (userId: UserId, resource: UserResource, app: Application) =>
    withFeathersErrors(
      createDomain(app.get('kysely')).isInAdminOrigins(
        String(resource.id),
        String(userId)
      )
    )

const adminHasOriginPermissionForFarm =
  adminHasOriginPermission(createFarmsDomain)

const adminHasOriginPermissionForDepot =
  adminHasOriginPermission(createDepotsDomain)

const adminHasOriginPermissionForInitiative = adminHasOriginPermission(
  createInitiativesDomain
)

const farmWritable = () => {
  return [...WRITABLE_FARM_FIELDS, 'address', 'street', 'housenumber']
}

const depotWritable = () => {
  return [...WRITABLE_DEPOT_FIELDS, 'address', 'street', 'housenumber']
}

const initiativeWritable = () => {
  return [...WRITABLE_INITIATIVE_FIELDS, 'address', 'street', 'housenumber']
}

const anonymousUserScopes: Scope[] = [
  { scope: 'autocomplete:create' },
  { scope: 'geocoder:create' },
  { scope: 'entries:read' },
  { scope: 'authentication:create' },
  { scope: 'authManagement:create' },
  { scope: 'users:create' },
  { scope: 'users:update', condition: isUserRecordOfCurrentUser },
  { scope: 'users:read', condition: isUserRecordOfCurrentUser },
  { scope: 'entrycontactmessage:create' },
  { scope: 'products:read' },
  { scope: 'goals:read' },
  { scope: 'badges:read' },
  { scope: 'farms:read', fields: farmReadable },
  { scope: 'depots:read', fields: depotReadable },
  { scope: 'initiatives:read', fields: initiativeReadable },
  { scope: 'status:read' },
  { scope: 'user-reactivation:create' }
]

const webUserScope: Scope[] = [
  { scope: 'farms:create', fields: farmWritable },
  {
    scope: 'farms:update',
    fields: farmWritable,
    condition: isActiveAndOwnedByCurrentUser
  },
  { scope: 'farms:delete', condition: isActiveAndOwnedByCurrentUser },
  { scope: 'depots:create', fields: depotWritable },
  {
    scope: 'depots:update',
    fields: depotWritable,
    condition: isActiveAndOwnedByCurrentUser
  },
  { scope: 'depots:delete', condition: isActiveAndOwnedByCurrentUser },
  { scope: 'initiatives:create', fields: initiativeWritable },
  {
    scope: 'initiatives:update',
    fields: initiativeWritable,
    condition: isActiveAndOwnedByCurrentUser
  },
  { scope: 'initiatives:delete', condition: isActiveAndOwnedByCurrentUser }
]

const adminScopes: Scope[] = [
  { scope: 'admin/goals:read' },
  { scope: 'admin/badges:read' },
  { scope: 'admin/products:read' },
  { scope: 'admin/jobs:read' },
  { scope: 'admin/roles:read' },
  { scope: 'admin/origins:read' },
  { scope: 'admin/email-campaigns:read' },
  { scope: 'admin/email-messages:read' },
  { scope: 'admin/users/:userId/entries:read' },
  { scope: 'admin/entries:read' },
  {
    scope: 'admin/farms:read'
  },
  { scope: 'admin/farms:create', condition: adminHasOriginPermissionForFarm },
  { scope: 'admin/farms:update', condition: adminHasOriginPermissionForFarm },
  { scope: 'admin/farms:delete', condition: adminHasOriginPermissionForFarm },
  { scope: 'admin/depots:read' },
  { scope: 'admin/depots:create', condition: adminHasOriginPermissionForDepot },
  { scope: 'admin/depots:update', condition: adminHasOriginPermissionForDepot },
  { scope: 'admin/depots:delete', condition: adminHasOriginPermissionForDepot },
  { scope: 'admin/initiatives:read' },
  {
    scope: 'admin/initiatives:create',
    condition: adminHasOriginPermissionForInitiative
  },
  {
    scope: 'admin/initiatives:update',
    condition: adminHasOriginPermissionForInitiative
  },
  {
    scope: 'admin/initiatives:delete',
    condition: adminHasOriginPermissionForInitiative
  },
  { scope: 'admin/users:read' },
  { scope: 'admin/users:delete' },
  { scope: 'admin/bounces:read' },
  { scope: 'admin/jobs:read' },
  { scope: 'admin/stats:read' },
  { scope: 'admin/user-account-state-change:create' }
]

const permissions: Record<Role, Scope[]> = {
  guest: anonymousUserScopes,
  user: [...anonymousUserScopes, ...webUserScope],
  admin: [
    ...anonymousUserScopes,
    ...webUserScope,
    ...adminScopes,
    {
      scope: 'admin/users:update',
      fields: () => ['name', 'email', 'phone', 'admin_email_notifications']
    }
  ],
  superadmin: [
    ...anonymousUserScopes,
    ...webUserScope,
    ...adminScopes,
    { scope: 'admin/goals:create' },
    { scope: 'admin/goals:update' },
    { scope: 'admin/badges:create' },
    { scope: 'admin/badges:update' },
    { scope: 'admin/badges:delete' },
    { scope: 'admin/products:create' },
    { scope: 'admin/products:update' },
    { scope: 'admin/email-campaigns:update' },
    { scope: 'admin/email-campaigns:delete' },
    { scope: 'admin/email-messages:create' },
    { scope: 'admin/email-messages:update' },
    { scope: 'admin/email-messages:delete' },
    { scope: 'admin/user-reactivation:create' },
    { scope: 'admin/users:create' },
    {
      scope: 'admin/users:update'
    },
    { scope: 'admin/jobs:update' }
  ]
}

export default permissions
