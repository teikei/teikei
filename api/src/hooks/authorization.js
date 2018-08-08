import decode from 'jwt-decode'
import errors from '@feathersjs/errors'
import { hooks as authHooks } from '@feathersjs/authentication'
import { iff, isProvider } from 'feathers-hooks-common/lib/index'

export const addUserRolesToJwtPayload = async ctx => {
  const user = await ctx.app
    .service('users')
    .get(ctx.params.payload.userId, { query: { $eager: 'roles' } })

  Object.assign(ctx.params.payload, { roles: user && user.roles })
}

export const restrictToOwner = iff(isProvider('external'), async ctx => {
  if (!ctx.params.headers || !ctx.params.headers.authorization) {
    throw new errors.NotAuthenticated()
  }
  const { ownerships } = await ctx.service.get(ctx.id)
  if (!ownerships.find(u => u.id === ctx.params.payload.userId)) {
    throw new errors.NotAuthenticated()
  }
})

const restrictToRole = name =>
  iff(isProvider('external'), authHooks.authenticate('jwt'), ctx => {
    if (!ctx.params.headers || !ctx.params.headers.authorization) {
      throw new errors.NotAuthenticated()
    }
    const { roles } = decode(ctx.params.headers.authorization)
    if (!roles.find(r => r.name === name)) {
      throw new errors.Forbidden(
        'You are not authorized to perform this action'
      )
    }
  })

export const restrictToUser = restrictToRole('user')
export const restrictToAdmin = restrictToRole('admin')
export const restrictToSuperAdmin = ctx => {} // restrictToRole('superadmin')
