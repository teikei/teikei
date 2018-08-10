import bcrypt from 'bcryptjs'
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

export const validateUserPassword = iff(
  isProvider('external'),
  ctx => {
    const {
      data: { currentPassword },
      params: { user }
    } = ctx
    if (!currentPassword) {
      throw new errors.NotAuthenticated('Missing password for verification')
    }
    bcrypt.compare(currentPassword, user.password, (error, result) => {
      if (error) {
        throw new errors.GeneralError('Password Verification failed')
      } else if (!result) {
        throw new errors.NotAuthenticated('Password incorrect')
      }
    })
    delete ctx.data.currentPassword
    ctx.id = user.id
    return ctx
  }
)

export default setOrigin
