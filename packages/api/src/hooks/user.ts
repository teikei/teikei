import { hooks as localHooks } from '@feathersjs/authentication-local'
import { NotAuthenticated } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'
import bcrypt from 'bcryptjs'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common'
import { errorCodes, withErrorCode } from '../utils/errorCodes.ts'

export const setOrigin = (ctx: HookContext) => {
  ctx.data.origin = ctx.params.headers?.origin
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
  ctx.data = Object.fromEntries(
    EXTERNAL_PATCHABLE_USER_FIELDS.filter((key) => key in ctx.data).map(
      (key) => [key, ctx.data[key]]
    )
  )
  return ctx
})

// The account fields no response or email may carry. params.user has them,
// as authentication needs the password.
export const USER_SECRET_FIELDS = [
  'password',
  'reactivationToken',
  'verifyToken',
  'verifyShortToken',
  'verifyExpires',
  'verifyChanges',
  'resetToken',
  'resetShortToken',
  'resetExpires'
]

export const protectUserFields = localHooks.protect(
  ...USER_SECRET_FIELDS,
  'resetAttempts'
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
