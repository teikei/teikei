import pino from 'pino'
import logger from 'feathers-logger'

export const appLogger = pino()

export default app => {
  appLogger.level = app.isDevelopment() ? 'debug' : 'info'
  app.configure(logger(appLogger))
}

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  app.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    const { arguments: args } = context
    app.debug('arguments', args)
  }

  if (error) {
    app.error(context.error.stack)
  }
}
