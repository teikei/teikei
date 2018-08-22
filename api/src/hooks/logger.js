import pino from 'pino'
import logger from 'feathers-logger'

const pinoLogger = pino()

export default app => {
  pinoLogger.level = process.env.NODE_ENV !== 'PRODUCTION' ? 'debug' : 'warn'
  app.configure(logger(pinoLogger))
}

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  app.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    app.debug(context, 'context')
  }

  if (error) {
    app.error(context.error)
    app.debug(context, 'error context')
  }

}
