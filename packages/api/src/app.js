import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import dotenv from 'dotenv'
import feathers from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import express from '@feathersjs/express'
import envHelpers from 'feathers-envhelpers'
import { iff } from 'feathers-hooks-common'
import { authenticate } from '@feathersjs/authentication'

import db from './db'
import middleware from './middleware'
import cors from './middleware/cors'
import logger, { loggerHook } from './hooks/logger'
import { authorize } from './hooks/authorization'
import services from './services'
import jobs from './jobs'
import errorHandler from './hooks/errors'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const startApp = (configurationOverrides = {}) => {
  const app = express(feathers())
  app.disable('x-powered-by')
  app.configure(express.rest())

  app.configure(envHelpers())
  app.configure(logger)

  const conf = configuration()
  app.configure(conf)
  Object.keys(configurationOverrides).forEach((key) => {
    app.set(key, configurationOverrides[key])
  })
  app.info(conf(), 'App configuration')
  app.info(configurationOverrides, 'application overrides')
  app.info('Feature toggles:')
  app.info(app.get('features'))
  app.configure(cors)

  app.use(helmet())
  app.use(compress())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.configure(middleware)
  app.configure(db)
  if (app.get('enableJobScheduler')) {
    app.configure(jobs)
  } else {
    app.info(
      'enableJobScheduler property is set to false, skipping job scheduler initialization'
    )
  }
  app.configure(services)

  app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
  app.use('/', express.static(app.get('public')))
  app.use(express.notFound())
  app.use(express.errorHandler(app.get('errorhandler')))

  app.hooks({
    before: {
      all: [
        loggerHook,
        iff(
          (ctx) => ctx.params.provider && ctx.path !== 'authentication',
          iff((ctx) => ctx.params.headers.authorization, authenticate('jwt')),
          authorize
        ),
      ],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    after: {
      all: [loggerHook],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },

    error: {
      all: [loggerHook, errorHandler],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
  return app
}

const appLauncher = {
  startApp,
}

export default appLauncher
