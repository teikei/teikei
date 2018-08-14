import { iff } from 'feathers-hooks-common/lib'

export const addUserRolesToJwtPayload = async ctx => {
  const user = await ctx.app
    .service('users')
    .get(ctx.params.payload.userId, { query: { $eager: 'roles' } })

  Object.assign(ctx.params.payload, { roles: user && user.roles })
}



