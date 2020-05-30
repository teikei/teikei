export const addUserRolesToJwtPayload = async (ctx) => {
  const user = await ctx.app
    .service('users')
    .get(ctx.params.payload.userId, { query: { $eager: 'roles' } })

  Object.assign(ctx.params.payload, { roles: user && user.roles })
}

export const addUserInfoToResponse = async (ctx) => {
  const { email, name, phone } = ctx.params.user
  ctx.result.user = { email, name, phone }
}
