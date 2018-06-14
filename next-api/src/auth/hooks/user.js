import { iff, isProvider, preventChanges } from 'feathers-hooks-common'

export const setOrigin = ctx => {
  ctx.data.origin = ctx.params.headers.host
}

export const protectUserFields = iff(
  isProvider('external'),
  preventChanges(
    true,
    'email',
    'is_verified',
    'verify_token',
    'verify_short_token',
    'verify_expires',
    'verify_changes',
    'reset_token',
    'reset_short_token',
    'reset_expires'
  )
)

export const convertVerifyExpirationDates = ctx => {
  if (ctx.data.verifyExpires) {
    ctx.data.verifyExpires = new Date(ctx.data.verifyExpires).toISOString()
  }
  if (ctx.data.resetExpires) {
    ctx.data.resetExpires = new Date(ctx.data.resetExpires).toISOString()
  }
}

export default setOrigin
