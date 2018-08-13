import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import feathers from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import express from '@feathersjs/express'
import envHelpers from 'feathers-envhelpers'
import { iff } from 'feathers-hooks-common'
import { hooks as authHooks} from '@feathersjs/authentication'

import db from './db'
import middleware from './middleware'
import logger, { loggerHook } from './hooks/logger'
import authorize from './hooks/authorization'

import services from './services'

dotenv.config()

const app = express(feathers())
app.configure(express.rest())
app.configure(logger)

const conf = configuration()
app.info('App configuration:')
app.configure(conf)
console.log(conf())

app.use(cors())
app.use(helmet())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.configure(middleware)
app.configure(db)
app.configure(envHelpers())
app.configure(services)

app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
app.use('/', express.static(app.get('public')))
app.use(express.notFound())
app.use(express.errorHandler(app.get('errorhandler')))

app.hooks({
  before: {
    all: [loggerHook, iff(ctx => ctx.params.provider, authorize())],
    find: [],
    get: [],
    create: [authHooks.authenticate(['jwt', 'local'])],
    update: [authHooks.authenticate('jwt')],
    patch: [authHooks.authenticate('jwt')],
    remove: [authHooks.authenticate('jwt')]
  },

  after: {
    all: [loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default app
