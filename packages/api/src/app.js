// organize-imports-ignore
import 'dotenv/config'
import { authenticate } from '@feathersjs/authentication'
import configuration from '@feathersjs/configuration'
import express, {
  cors,
  errorHandler,
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
import services from './services'

const startApp = (configurationOverrides = {}) => {
  const app = express(feathers())
  app.disable('x-powered-by')

  app.configure(envHelpers())

  const conf = configuration()
  app.configure(conf)
  Object.keys(configurationOverrides).forEach((key) => {
    app.set(key, configurationOverrides[key])
  })
  logger.info(process.env.GEOCODER_APP_ID)
  logger.info(JSON.stringify(app.get('search')))
  logger.info(`App configuration: ${JSON.stringify(conf(), null, 2)}`)
  logger.info(`Overrides: ${JSON.stringify(configurationOverrides, null, 2)}`)
  logger.info(
    `Feature toggles: ${JSON.stringify(app.get('features'), null, 2)}`
  )
  app.use(
    cors({
      origin: parseCorsOrigins(app.get('corsOrigins')),
      optionsSuccessStatus: 200
    })
  )
  app.use(json())
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
  app.use(errorHandler({ logger }))

  logger.info(JSON.stringify(app.get('search')))

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
