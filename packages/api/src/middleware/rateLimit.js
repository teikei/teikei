import { rateLimit } from 'express-rate-limit'
import { logger } from '../logger'

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
const buildLimiter = ({ windowMs, max }, extra = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    ...extra
  })

export default (app) => {
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
    if (path.startsWith('/authentication')) {
      return authLimiter(req, res, next)
    }
    if (path.startsWith('/authManagement')) {
      return passwordResetLimiter(req, res, next)
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
