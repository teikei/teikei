import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'
import {
  normalizeErrorCode,
  suppressEnumerationError
} from '../services/authManagement.js'
import { errorCodes } from '../utils/errorCodes.js'

// The exact strings thrown by feathers-authentication-management. If a library
// upgrade rewords one of these, the corresponding case fails here instead of
// silently regressing to untranslated English in the UI.
const mappings = [
  ['User not found.', 'sendResetPwd', errorCodes.USER_NOT_FOUND],
  [
    'User is already verified.',
    'resendVerifySignup',
    errorCodes.USER_ALREADY_VERIFIED
  ],
  [
    'User is already verified & not awaiting changes.',
    'resendVerifySignup',
    errorCodes.USER_ALREADY_VERIFIED
  ],
  ['User is not verified.', 'sendResetPwd', errorCodes.USER_NOT_VERIFIED],
  [
    'Verification token has expired.',
    'verifySignupLong',
    errorCodes.VERIFICATION_TOKEN_EXPIRED
  ],
  [
    'Password reset token has expired.',
    'resetPwdLong',
    errorCodes.RESET_TOKEN_EXPIRED
  ],
  [
    'Current password is incorrect.',
    'passwordChange',
    errorCodes.CURRENT_PASSWORD_INCORRECT
  ],
  ['Password is incorrect.', 'identityChange', errorCodes.PASSWORD_INCORRECT],
  [
    'Reset Token is incorrect. (authLocalMgnt)',
    'resetPwdLong',
    errorCodes.RESET_TOKEN_INVALID
  ]
]

const AMBIGUOUS_TOKEN_MESSAGE =
  'Invalid token. Get for a new one. (authLocalMgnt)'

const errorContext = (message, action) => ({
  data: { action },
  error: new BadRequest(message)
})

// The cases above build the errors by hand, so on their own they would keep
// passing if the library reworded a message. Reading the shipped bundle closes
// that gap: an upgrade that changes a string fails here.
describe('library message contract', () => {
  const distDir = path.join(
    path.dirname(
      require.resolve('feathers-authentication-management/package.json')
    ),
    'dist'
  )
  const bundle = fs
    .readdirSync(distDir, { recursive: true })
    .filter((entry) => String(entry).endsWith('.js'))
    .map((entry) => fs.readFileSync(path.join(distDir, String(entry)), 'utf8'))
    .join('\n')

  it.each([...mappings.map(([message]) => message), AMBIGUOUS_TOKEN_MESSAGE])(
    'feathers-authentication-management still throws "%s"',
    (message) => {
      expect(bundle).toContain(message)
    }
  )
})

describe('authManagement error normalization', () => {
  it.each(mappings)('maps "%s" (%s) to %s', (message, action, expected) => {
    const ctx = normalizeErrorCode(errorContext(message, action))

    expect(ctx.error.toJSON().data.errorCode).toBe(expected)
  })

  it.each([
    ['resetPwdLong', errorCodes.RESET_TOKEN_INVALID],
    ['verifySignupLong', errorCodes.VERIFICATION_TOKEN_INVALID],
    ['verifySignupSetPasswordLong', errorCodes.VERIFICATION_TOKEN_INVALID]
  ])(
    'disambiguates the shared invalid-token message for %s',
    (action, expected) => {
      const ctx = normalizeErrorCode(
        errorContext(AMBIGUOUS_TOKEN_MESSAGE, action)
      )

      expect(ctx.error.toJSON().data.errorCode).toBe(expected)
    }
  )

  it('gives a bad reset token and a bad verification token different codes', () => {
    const reset = normalizeErrorCode(
      errorContext(AMBIGUOUS_TOKEN_MESSAGE, 'resetPwdLong')
    )
    const verify = normalizeErrorCode(
      errorContext(AMBIGUOUS_TOKEN_MESSAGE, 'verifySignupLong')
    )

    expect(reset.error.data.errorCode).not.toBe(verify.error.data.errorCode)
  })

  it('leaves an unmapped library message uncoded', () => {
    const ctx = normalizeErrorCode(
      errorContext('More than 1 user selected.', 'resetPwdLong')
    )

    expect(ctx.error.toJSON().data?.errorCode).toBeUndefined()
  })

  it('leaves the shared invalid-token message uncoded for an unknown action', () => {
    const ctx = normalizeErrorCode(
      errorContext(AMBIGUOUS_TOKEN_MESSAGE, 'checkUnique')
    )

    expect(ctx.error.toJSON().data?.errorCode).toBeUndefined()
  })
})

// The enumeration guard must win: a guest-triggered action may not reveal
// whether the address is registered, and a code would do exactly that.
describe('composition with the enumeration guard', () => {
  const hookOrders = [
    ['normalize then suppress', [normalizeErrorCode, suppressEnumerationError]],
    ['suppress then normalize', [suppressEnumerationError, normalizeErrorCode]]
  ]

  it.each(hookOrders)('leaks no code for sendResetPwd (%s)', (_name, hooks) => {
    const ctx = hooks.reduce(
      (acc, hook) => hook(acc),
      errorContext('User not found.', 'sendResetPwd')
    )

    expect(ctx.error).toBeNull()
    expect(ctx.result).toEqual({})
  })

  it.each(hookOrders)(
    'leaks no code for resendVerifySignup (%s)',
    (_name, hooks) => {
      const ctx = hooks.reduce(
        (acc, hook) => hook(acc),
        errorContext('User is already verified.', 'resendVerifySignup')
      )

      expect(ctx.error).toBeNull()
      expect(ctx.result).toEqual({})
    }
  )

  it('still codes an authenticated action', () => {
    const ctx = [normalizeErrorCode, suppressEnumerationError].reduce(
      (acc, hook) => hook(acc),
      errorContext('Current password is incorrect.', 'passwordChange')
    )

    expect(ctx.error.toJSON().data.errorCode).toBe(
      errorCodes.CURRENT_PASSWORD_INCORRECT
    )
  })
})
