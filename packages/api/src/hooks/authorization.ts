import { Forbidden } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'
import { jwtDecode } from 'jwt-decode'
import { withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createDepotsDomain } from '../domain/depots.ts'
import { createFarmsDomain } from '../domain/farms.ts'
import { createInitiativesDomain } from '../domain/initiatives.ts'
import permissions, {
  type EntryResource,
  type Role,
  type UserResource
} from '../permissions.ts'
import { errorCodes, withErrorCode } from '../utils/errorCodes.ts'

// The authentication service adds the user's roles to the payload.
type RolesPayload = { roles: { name: string }[] }

const extractRolesFromJwtToken = (ctx: HookContext): string[] => {
  if (ctx.params.headers && ctx.params.headers.authorization) {
    return jwtDecode<RolesPayload>(ctx.params.headers.authorization).roles.map(
      (r) => r.name
    )
  }
  if (ctx.result && ctx.result.accessToken) {
    return jwtDecode<RolesPayload>(ctx.result.accessToken).roles.map(
      (r) => r.name
    )
  }
  return []
}

const resolveMethod = (method: string) => {
  switch (method) {
    case 'find':
    case 'get':
      return 'read'
    case 'patch':
      return 'update'
    case 'create':
      return 'create'
    case 'remove':
      return 'delete'
  }
}

const getMaximumAccessRole = (roles: string[]): Role => {
  if (roles.includes('superadmin')) {
    return 'superadmin'
  } else if (roles.includes('admin')) {
    return 'admin'
  } else if (roles.includes('user')) {
    return 'user'
  } else {
    return 'guest'
  }
}

const getScopeFor = (roles: string[], service: string, method: string) => {
  const resolvedMethod = resolveMethod(method)
  const maxRole = getMaximumAccessRole(roles)
  return permissions[maxRole].find(
    (s) => s.scope === `${service}:${resolvedMethod}`
  )
}

type EntryDomain = (db: Database) => {
  getForAuthorization(id: string, activeOnly: boolean): Promise<EntryResource>
}

// What the permission conditions and field scopes read. Entries come from the
// domains as { id, active, ownerships }; the public paths only find active
// entries, as their get answers 404 for inactive ones.
// It runs before the service, outside its error hooks, so it maps database
// errors itself.
const entryLoader =
  (createDomain: EntryDomain, activeOnly: boolean) => (ctx: HookContext) =>
    withFeathersErrors(
      createDomain(ctx.app.get('kysely')).getForAuthorization(
        String(ctx.id),
        activeOnly
      )
    )

const loaders: Record<string, (ctx: HookContext) => Promise<EntryResource>> = {
  farms: entryLoader(createFarmsDomain, true),
  depots: entryLoader(createDepotsDomain, true),
  initiatives: entryLoader(createInitiativesDomain, true),
  'admin/farms': entryLoader(createFarmsDomain, false),
  'admin/depots': entryLoader(createDepotsDomain, false),
  'admin/initiatives': entryLoader(createInitiativesDomain, false)
}

const fetchResource = (ctx: HookContext) =>
  loaders[ctx.path]
    ? loaders[ctx.path](ctx)
    : ctx.service.get(ctx.id, { provider: null })

export const authorize = async (ctx: HookContext) => {
  const { method, path: serviceName } = ctx

  const roles = extractRolesFromJwtToken(ctx)

  const scope = getScopeFor(roles, serviceName, method)

  if (!scope) {
    throw withErrorCode(
      new Forbidden(`You are not allowed to ${method} ${serviceName}.`),
      errorCodes.FORBIDDEN
    )
  }

  let resource: EntryResource | UserResource | undefined
  if (ctx.id && (scope.condition || scope.fields)) {
    resource = await fetchResource(ctx)
  }

  const currentUserId = ctx.params.user && ctx.params.user.id

  if (scope.condition) {
    const allowed = await scope.condition(currentUserId, resource, ctx.app)

    if (!allowed) {
      throw withErrorCode(
        new Forbidden(`You are not allowed to ${method} ${serviceName}.`),
        errorCodes.FORBIDDEN
      )
    }
  }

  if (scope.fields) {
    const allowedFields = scope.fields(currentUserId, resource)
    ctx.allowedFields = allowedFields
    const forbiddenFields = Object.keys(ctx.data ?? {}).filter(
      (key) => !allowedFields.includes(key)
    )
    if (forbiddenFields.length > 0) {
      throw withErrorCode(
        new Forbidden(
          `You are not allowed to write fields ${forbiddenFields} of ${serviceName}`
        ),
        errorCodes.FORBIDDEN_FIELDS
      )
    }
  }

  return ctx
}
