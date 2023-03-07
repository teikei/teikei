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
  'deliveryDays',
]
const READABLE_DEPOT_FIELDS = [
  ...WRITABLE_DEPOT_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt',
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
  'badges',
]
const READABLE_FARM_FIELDS = [
  ...WRITABLE_FARM_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt',
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
  'badges',
]
const READABLE_INITIATIVE_FIELDS = [
  ...WRITABLE_INITIATIVE_FIELDS,
  'type',
  'link',
  'createdAt',
  'updatedAt',
]

const isOwnedByCurrentUser = (userId, resource) =>
  resource.properties.ownerships.some((o) => o.id === userId)

const isActiveAndOwnedByCurrentUser = (userId, resource) => {
  return resource.properties.active && isOwnedByCurrentUser(userId, resource)
}

const isUserRecordOfCurrentUser = (userId, resource) => userId === resource.id

const farmReadable = (userId, resource) => {
  const fields = READABLE_FARM_FIELDS
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address')
    fields.push('street')
  }
  return fields
}

const depotReadable = (userId, resource) => {
  const fields = READABLE_DEPOT_FIELDS
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address')
    fields.push('street')
  }
  return fields
}

const initiativeReadable = (userId, resource) => {
  const fields = READABLE_INITIATIVE_FIELDS
  if (resource && isOwnedByCurrentUser(userId, resource)) {
    fields.push('address')
    fields.push('street')
  }
  return fields
}

const farmWritable = (userId, resource) => {
  return [...WRITABLE_FARM_FIELDS, 'address', 'street']
}

const depotWritable = (userId, resource) => {
  return [...WRITABLE_DEPOT_FIELDS, 'address', 'street']
}

const initiativeWritable = (userId, resource) => {
  return [...WRITABLE_INITIATIVE_FIELDS, 'address', 'street']
}

const anonymousUserScopes = [
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
]

const webUserScope = [
  { scope: 'farms:create', fields: farmWritable },
  {
    scope: 'farms:update',
    fields: farmWritable,
    condition: isActiveAndOwnedByCurrentUser,
  },
  { scope: 'farms:delete', condition: isActiveAndOwnedByCurrentUser },
  { scope: 'depots:create', fields: depotWritable },
  {
    scope: 'depots:update',
    fields: depotWritable,
    condition: isActiveAndOwnedByCurrentUser,
  },
  { scope: 'depots:delete', condition: isActiveAndOwnedByCurrentUser },
  { scope: 'initiatives:create', fields: initiativeWritable },
  {
    scope: 'initiatives:update',
    fields: initiativeWritable,
    condition: isActiveAndOwnedByCurrentUser,
  },
  { scope: 'initiatives:delete', condition: isActiveAndOwnedByCurrentUser },
]

const adminScopes = [
  { scope: 'admin/goals:read' },
  { scope: 'admin/badges:read' },
  { scope: 'admin/products:read' },
  { scope: 'admin/jobs:read' },
  { scope: 'admin/roles:read' },
  { scope: 'admin/users/:userId/entries:read' },
  { scope: 'admin/farms:read' },
  { scope: 'admin/farms:create' },
  { scope: 'admin/farms:update' },
  { scope: 'admin/farms:delete' },
  { scope: 'admin/depots:read' },
  { scope: 'admin/depots:create' },
  { scope: 'admin/depots:update' },
  { scope: 'admin/depots:delete' },
  { scope: 'admin/initiatives:read' },
  { scope: 'admin/initiatives:create' },
  { scope: 'admin/initiatives:update' },
  { scope: 'admin/initiatives:delete' },
  { scope: 'admin/users:read' },
  { scope: 'admin/users:create' },
  { scope: 'admin/users:update' },
  { scope: 'admin/users:delete' },
]

const superAdminScopes = [
  { scope: 'admin/goals:create' },
  { scope: 'admin/goals:update' },
  { scope: 'admin/badges:create' },
  { scope: 'admin/badges:update' },
  { scope: 'admin/badges:delete' },
  { scope: 'admin/products:create' },
  { scope: 'admin/products:update' },
]

const permissions = {
  guest: anonymousUserScopes,
  user: [...anonymousUserScopes, ...webUserScope],
  admin: [...anonymousUserScopes, ...webUserScope, ...adminScopes],
  superadmin: [
    ...anonymousUserScopes,
    ...webUserScope,
    ...adminScopes,
    ...superAdminScopes,
  ],
}

export default permissions
