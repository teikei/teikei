import { iff, isProvider, preventChanges } from 'feathers-hooks-common'

export const setOrigin = ctx => {
  const { referer, origin, host } = ctx.params.headers
  ctx.data.origin = referer || origin || host
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

export default setOrigin
