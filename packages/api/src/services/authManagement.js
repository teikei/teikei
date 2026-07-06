import { authenticate } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { logger } from '../logger'

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

const suppressEnumerationError = (ctx) => {
  if (isGuestEmailAction(ctx)) {
    logger.info(
      `authManagement '${ctx.data.action}' returned a generic response (enumeration guard); underlying result: ${ctx.error && ctx.error.message}`
    )
    ctx.error = null
    ctx.result = genericResult()
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
      create: [suppressEnumerationError]
    }
  })
}
