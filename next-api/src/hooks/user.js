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
    'isVerified',
    'verifTtoken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetShortToken',
    'resetExpires'
  )
)

export default setOrigin
