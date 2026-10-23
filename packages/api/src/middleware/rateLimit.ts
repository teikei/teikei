import { TooManyRequests } from '@feathersjs/errors'
import type { Application } from '@feathersjs/express'
import type { Request, Response } from 'express'
import { rateLimit, type Options } from 'express-rate-limit'
import { logger } from '../logger.ts'
import { errorCodes, withErrorCode } from '../utils/errorCodes.ts'

// IP-based rate limiting for the unauthenticated / abuse-prone endpoints:
// login brute-force, registration + password-reset spam and enumeration, and
// the guest contact endpoint that emails entry owners. Limits are config-driven
// (see config/*.json `rateLimit`). Client IP resolution depends on the
// `trust proxy` setting configured in app.js.
//
// Mounted as a single path-agnostic Express middleware (Feathers 5's app.use
// does not treat `app.use(path, fn)` as plain path middleware) that dispatches
// to the matching limiter. It only sees real HTTP requests — internal
// `app.service(...)` calls bypass it, as do the (direct-call) integration tests.
// Only the authManagement actions that send an email are abuse vectors (reset
// request + verification resend → enumeration / email-bombing). Completing a
// reset or confirmation (resetPwdLong / verifySignupLong) and authenticated
// changes (passwordChange / identityChange) must not share that quota.
const EMAIL_AUTH_MANAGEMENT_ACTIONS = new Set([
  'sendResetPwd',
  'resendVerifySignup'
])

// express-rate-limit answers with a plain-text body by default, which makes
// clients that parse JSON fall back to their own hardcoded wording. Emitting the
// same shape as every other API error lets them resolve the code instead.
const sendRateLimited = (req: Request, res: Response) => {
  const error = withErrorCode(
    new TooManyRequests('Too many requests, please try again later.'),
    errorCodes.RATE_LIMITED
  )
  res.status(error.code).json(error.toJSON())
}

type LimitConfig = { windowMs: number; max: number }

const buildLimiter = (
  { windowMs, max }: LimitConfig,
  extra: Partial<Options> = {}
) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: sendRateLimited,
    ...extra
  })

export default (app: Application) => {
  const config = app.get('rateLimit') || {}

  if (config.enabled === false) {
    logger.info('Rate limiting is disabled.')
    return
  }

  // Login: only failed attempts count, so a legitimate user is never locked out.
  const authLimiter = buildLimiter(config.auth, {
    skipSuccessfulRequests: true
  })
  // Password reset / verification resend (guest-triggered).
  const passwordResetLimiter = buildLimiter(config.passwordReset)
  // Registration is the only public write on /users.
  const registerLimiter = buildLimiter(config.register)
  // Guest contact messages email the entry owner — cap to prevent email-bombing.
  const contactLimiter = buildLimiter(config.contact)

  app.use((req, res, next) => {
    const path = req.path
    const body = req.body || {}

    // Login brute-force: only throttle password logins. The embed app posts
    // strategy: 'jwt' on every startup to re-validate a stored token, which
    // fails on a stale token — that must not consume the login budget and lock
    // the user out of a subsequent password sign-in.
    if (path.startsWith('/authentication')) {
      return body.strategy === 'local' ? authLimiter(req, res, next) : next()
    }
    // Only throttle the email-sending management actions.
    if (path.startsWith('/authManagement')) {
      return EMAIL_AUTH_MANAGEMENT_ACTIONS.has(body.action)
        ? passwordResetLimiter(req, res, next)
        : next()
    }
    // Only throttle registration (POST); leave authenticated PATCH/GET alone.
    if (path.startsWith('/users') && req.method === 'POST') {
      return registerLimiter(req, res, next)
    }
    if (path.startsWith('/entrycontactmessage')) {
      return contactLimiter(req, res, next)
    }
    return next()
  })
}
