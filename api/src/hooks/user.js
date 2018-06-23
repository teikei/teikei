import bcrypt from 'bcryptjs'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common'
import { hooks as authHooks } from '@feathersjs/authentication'
import errors from '@feathersjs/errors'
import { restrictToUser } from './authorization'

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

export const validateExternalUser = iff(
  isProvider('external'),
  authHooks.authenticate('jwt'),
  restrictToUser,
  ctx => {
    const {
      // TODO move to snake case
      // eslint-disable-next-line camelcase
      data: { current_password },
      params: { user }
    } = ctx
    // TODO move to snake case
    // eslint-disable-next-line camelcase
    if (!current_password) {
      throw new errors.NotAuthenticated('Missing password for verification')
    }
    bcrypt.compare(current_password, user.password, (error, result) => {
      if (error) {
        throw new errors.GeneralError('Password Verification failed')
      } else if (!result) {
        throw new errors.NotAuthenticated('Password incorrect')
      }
    })
    delete ctx.data.current_password
    ctx.id = user.id
    return ctx
  }
)

export default setOrigin
