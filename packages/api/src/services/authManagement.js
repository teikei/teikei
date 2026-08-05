import { authenticate } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import { logger } from '../logger.js'
import { errorCodes, withErrorCode } from '../utils/errorCodes.js'

const isAction =
  (...args) =>
  (hook) =>
    args.includes(hook.data.action)

// Guest-triggered actions that email the user. feathers-authentication-management
// otherwise leaks account existence and verification state: an unknown email
// throws "User not found.", a known-but-unverified one throws "User is not
// verified.", and a verified one succeeds — a fully unauthenticated enumeration
// oracle. For these actions we return an identical generic response whether the
// account exists or not, and swallow (but log) the lookup error. The notifier
// still fires only for real users.
const GUEST_EMAIL_ACTIONS = ['sendResetPwd', 'resendVerifySignup']

const isGuestEmailAction = (ctx) =>
  GUEST_EMAIL_ACTIONS.includes(ctx.data && ctx.data.action)

const genericResult = () => ({})

const uniformGuestResponse = (ctx) => {
  if (isGuestEmailAction(ctx)) {
    ctx.result = genericResult()
  }
  return ctx
}

export const suppressEnumerationError = (ctx) => {
  if (isGuestEmailAction(ctx)) {
    logger.info(
      `authManagement '${ctx.data.action}' returned a generic response (enumeration guard); underlying result: ${ctx.error && ctx.error.message}`
    )
    ctx.error = null
    ctx.result = genericResult()
  }
  return ctx
}

// feathers-authentication-management throws fixed English strings that map-next
// would otherwise show verbatim. Mapping them to codes keeps third-party wording
// out of the client and turns a library upgrade that rewords a message into a
// failing test rather than a silent UI regression.
const CODES_BY_MESSAGE = {
  'User not found.': errorCodes.USER_NOT_FOUND,
  'User is already verified.': errorCodes.USER_ALREADY_VERIFIED,
  'User is already verified & not awaiting changes.':
    errorCodes.USER_ALREADY_VERIFIED,
  'User is not verified.': errorCodes.USER_NOT_VERIFIED,
  'Verification token has expired.': errorCodes.VERIFICATION_TOKEN_EXPIRED,
  'Password reset token has expired.': errorCodes.RESET_TOKEN_EXPIRED,
  'Current password is incorrect.': errorCodes.CURRENT_PASSWORD_INCORRECT,
  'Password is incorrect.': errorCodes.PASSWORD_INCORRECT,
  'Reset Token is incorrect. (authLocalMgnt)': errorCodes.RESET_TOKEN_INVALID
}

// The password-reset and signup-verification flows throw this same string, so
// only the requested action tells them apart.
const AMBIGUOUS_TOKEN_MESSAGE =
  'Invalid token. Get for a new one. (authLocalMgnt)'

const AMBIGUOUS_TOKEN_CODES = {
  resetPwdLong: errorCodes.RESET_TOKEN_INVALID,
  verifySignupLong: errorCodes.VERIFICATION_TOKEN_INVALID,
  verifySignupSetPasswordLong: errorCodes.VERIFICATION_TOKEN_INVALID
}

// Runs alongside suppressEnumerationError, which nulls the error for guest
// actions — hence the guard, so the two compose in either order.
export const normalizeErrorCode = (ctx) => {
  if (!ctx.error) {
    return ctx
  }
  const code =
    ctx.error.message === AMBIGUOUS_TOKEN_MESSAGE
      ? AMBIGUOUS_TOKEN_CODES[ctx.data?.action]
      : CODES_BY_MESSAGE[ctx.error.message]
  if (code) {
    withErrorCode(ctx.error, code)
  }
  return ctx
}

export default (app) => {
  app.configure(
    authManagement({
      notifier: (type, user) => {
        switch (type) {
          case 'sendResetPwd':
            app
              .service('emails')
              .create({
                template: 'reset_password_instructions',
                message: {
                  to: user.email
                },
                locals: {
                  locale: user.locale,
                  user,
                  sender_email: 'kontakt@ernte-teilen.org'
                }
              })
              .catch((err) =>
                logger.warn(
                  `failed to send reset password email to user ${user.id} (${user.email}): ${err?.message}`,
                  err
                )
              )
            break
          default:
            logger.error('unknown authentication management has been called.')
        }
      }
    })
  )

  app.service('authManagement').hooks({
    before: {
      create: [
        iff(isAction('passwordChange', 'identityChange'), authenticate('jwt'))
      ]
    },
    after: {
      create: [uniformGuestResponse, filterAllowedFields]
    },
    error: {
      create: [normalizeErrorCode, suppressEnumerationError]
    }
  })
}
