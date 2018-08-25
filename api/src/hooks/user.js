import bcrypt from 'bcrypt'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common'
import errors from '@feathersjs/errors'

export const setOrigin = ctx => {
  const { referer, origin, host } = ctx.params.headers
  ctx.data.origin = referer || origin || host
}

export const protectUserFields = iff(
  isProvider('external'),
  preventChanges(
    true,
    'email',
    'password',
    'isVerified',
    'verifyTtoken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetShortToken',
    'resetExpires'
  )
)

export const validateUserPassword = iff(isProvider('external'), async ctx => {
  const {
    data: { password },
    params: { user }
  } = ctx
  if (!password) {
    throw new errors.NotAuthenticated('Missing password for verification')
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new errors.NotAuthenticated('Password incorrect')
  }
  delete ctx.data.password
  ctx.id = user.id
  return ctx
})

export default setOrigin
