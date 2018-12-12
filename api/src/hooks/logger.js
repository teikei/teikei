import pino from 'pino'
import logger from 'feathers-logger'

export const appLogger = pino()

export default app => {
  appLogger.level = process.env.NODE_ENV === 'DEVELOPMENT' ? 'debug' : 'warn'
  app.configure(logger(appLogger))
}

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  app.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    app.debug(context, 'context')
  }

  if (error) {
    app.error(context.error.stack)
  }
}
