// organize-imports-ignore
import 'dotenv/config'
import { authenticate } from '@feathersjs/authentication'
import configuration from '@feathersjs/configuration'
import express, {
  cors,
  json,
  notFound,
  rest,
  serveStatic,
  urlencoded
} from '@feathersjs/express'
import { feathers } from '@feathersjs/feathers'
import compress from 'compression'
import envHelpers from 'feathers-envhelpers'
import { iff } from 'feathers-hooks-common'
import helmet from 'helmet'
import path from 'path'
import favicon from 'serve-favicon'
import db from './db'
import { authorize } from './hooks/authorization'
import { logError } from './hooks/logError.js'
import jobs from './jobs'
import { logger } from './logger'
import middleware from './middleware'
import { parseCorsOrigins } from './middleware/cors'
import serverErrorHandler from './middleware/errorHandler'
import rateLimiting from './middleware/rateLimit'
import services from './services'
import { maskSensitive } from './utils/maskSensitive'

const startApp = (configurationOverrides = {}) => {
  const app = express(feathers())
  app.disable('x-powered-by')

  app.configure(envHelpers())

  const conf = configuration()
  app.configure(conf)
  Object.keys(configurationOverrides).forEach((key) => {
    app.set(key, configurationOverrides[key])
  })

  // Fail fast in production if the JWT signing secret is missing, still the
  // committed dev placeholder, or an unresolved env-var name. A weak/known
  // secret lets anyone forge tokens (including superadmin) — never boot with it.
  if (process.env.NODE_ENV === 'production') {
    const secret = app.get('authentication')?.secret
    const insecureSecrets = [
      'SECRET_TOKEN',
      'INSECURE_DEV_SECRET_DO_NOT_USE_IN_PRODUCTION_set_SECRET_TOKEN_env_var'
    ]
    if (!secret || secret.length < 32 || insecureSecrets.includes(secret)) {
      throw new Error(
        'Refusing to start: authentication.secret is missing or insecure. ' +
          'Set the SECRET_TOKEN environment variable to a strong random value.'
      )
    }
  }

  // Number of reverse-proxy hops to trust for client IP resolution (used by
  // rate limiting). In production this is Dokku's nginx (1 hop). Must NOT be
  // `true`, which would let clients spoof X-Forwarded-For.
  app.set('trust proxy', app.get('trustProxy') ?? false)

  const maskedConfig = maskSensitive(conf())
  const maskedOverrides = maskSensitive(configurationOverrides)
  const maskedSearchConfig = maskSensitive(app.get('search'))
  const maskedFeatures = maskSensitive(app.get('features'))

  logger.info(
    `Search configuration: ${JSON.stringify(maskedSearchConfig, null, 2)}`
  )
  logger.info(`App configuration: ${JSON.stringify(maskedConfig, null, 2)}`)
  logger.info(`Overrides: ${JSON.stringify(maskedOverrides, null, 2)}`)
  logger.info(`Feature toggles: ${JSON.stringify(maskedFeatures, null, 2)}`)
  app.use(
    cors({
      origin: parseCorsOrigins(app.get('corsOrigins')),
      optionsSuccessStatus: 200
    })
  )
  app.use(json())
  // Rate limiting must run before the REST transport routes requests to
  // services, so it is registered ahead of rest().
  app.configure(rateLimiting)
  app.configure(rest())
  app.use(helmet())
  app.use(compress())
  app.use(urlencoded({ extended: true }))
  app.use('/', serveStatic(app.get('public')))

  app.configure(middleware)
  app.configure(db)
  if (app.get('enableJobScheduler')) {
    app.configure(jobs)
  } else {
    logger.info(
      'enableJobScheduler property is set to false, skipping job scheduler initialization'
    )
  }
  app.configure(services)

  app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))
  app.use(notFound())
  app.use(serverErrorHandler())

  const maskedRuntimeSearchConfig = maskSensitive(app.get('search'))
  logger.info(
    `Search configuration (runtime): ${JSON.stringify(maskedRuntimeSearchConfig, null, 2)}`
  )

  app.hooks({
    around: {
      all: [logError]
    },
    before: {
      all: [
        iff(
          (ctx) => ctx.params.provider && ctx.path !== 'authentication',
          iff((ctx) => ctx.params.headers.authorization, authenticate('jwt')),
          authorize
        )
      ],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
  return app
}

const appLauncher = {
  startApp
}

export default appLauncher
