import { hooks as localHooks } from '@feathersjs/authentication-local'
import { NotAuthenticated } from '@feathersjs/errors'
import bcrypt from 'bcryptjs'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common'
import _ from 'lodash'
import { transaction } from 'objection'
import Role from '../models/roles.js'
import User from '../models/users.js'
import { errorCodes, withErrorCode } from '../utils/errorCodes.js'

export const setOrigin = (ctx) => {
  ctx.data.origin = _.get(ctx.params.headers, 'origin')
}

export const assignUserRole = async (ctx) => {
  await transaction(User.knex(), async (trx) => {
    const user = await User.query(trx).findById(ctx.result.id)
    const role = await Role.query(trx).where({ name: 'user' })
    user.$relatedQuery('roles', trx).unrelate()
    await user.$relatedQuery('roles', trx).relate(role)
  })
}

export const protectUserFieldChanges = iff(
  isProvider('external'),
  preventChanges(
    true,
    'password',
    'isVerified',
    'verifyToken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetAttempts',
    'resetShortToken',
    'resetExpires'
  )
)

// The only fields a user may change on their own record via an external PATCH.
// Everything else (active, state, origin, baseurl, reactivationToken, bounce*,
// timestamps, ...) is server-managed; without this allow-list a user could mass-
// assign those columns, since Joi validation is skipped on patch. `password` is
// consumed and removed earlier by validateUserPassword, so it is not listed here.
const EXTERNAL_PATCHABLE_USER_FIELDS = ['name', 'email', 'phone', 'locale']

export const restrictUserPatchFields = iff(isProvider('external'), (ctx) => {
  ctx.data = _.pick(ctx.data, EXTERNAL_PATCHABLE_USER_FIELDS)
  return ctx
})

export const protectUserFields = localHooks.protect(
  'password',
  'verifyToken',
  'verifyShortToken',
  'verifyExpires',
  'verifyChanges',
  'resetToken',
  'resetAttempts',
  'resetShortToken',
  'resetExpires'
)

export const validateUserPassword = iff(isProvider('external'), async (ctx) => {
  const {
    data: { password },
    params: { user }
  } = ctx
  if (!password) {
    throw withErrorCode(
      new NotAuthenticated('Missing password for verification'),
      errorCodes.PASSWORD_REQUIRED
    )
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw withErrorCode(
      new NotAuthenticated('Password incorrect'),
      errorCodes.PASSWORD_INCORRECT
    )
  }
  delete ctx.data.password
  ctx.id = user.id
  return ctx
})

export default setOrigin
