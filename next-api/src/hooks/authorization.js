import decode from 'jwt-decode'
import errors from '@feathersjs/errors'

export const addUserRolesToJwtPayload = async ctx => {
  const user = await ctx.app
    .service('users')
    .get(ctx.params.payload.userId, { query: { $eager: 'roles' } })

  Object.assign(ctx.params.payload, { roles: user && user.roles })
}

export const restrictToOwner = async ctx => {
  if (!ctx.params.headers || !ctx.params.headers.authorization) {
    throw new errors.NotAuthenticated()
  }
  const { ownerships } = await ctx.service.getWithOwnerships(ctx.id)
  if (!ownerships.find(u => u.id === ctx.params.payload.userId)) {
    throw new errors.NotAuthenticated()
  }
}

const restrictToRole = name => ctx => {
  if (!ctx.params.headers || !ctx.params.headers.authorization) {
    throw new errors.NotAuthenticated()
  }
  const { roles } = decode(ctx.params.headers.authorization)
  if (!roles.find(r => r.name === name)) {
    throw new errors.NotAuthenticated()
  }
}

export const restrictToUser = restrictToRole('user')
export const restrictToAdmin = restrictToRole('admin')
export const restrictToSuperAdmin = restrictToRole('superadmin')
