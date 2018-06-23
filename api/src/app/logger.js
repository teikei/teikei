import pino from 'pino'
import pinoExpress from 'express-pino-logger'
import logger from 'feathers-logger'

export default app => {
  const pinoLogger = pino()
  pinoLogger.level = process.env.NODE_ENV !== 'PRODUCTION' ? 'debug' : 'warn'
  app.configure(logger(pinoLogger))
  app.use(pinoExpress())
}

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  app.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    app.debug('Hook Context', context)
  }

  if (error) {
    const {
      error: { name, message, data: errorData },
      data,
      result,
      params,
      dispatch
    } = context
    app.error(name, message, errorData)
    app.debug('context.params', params)
    app.debug('context.data', data)
    app.debug('context.result', result)
    app.debug('context.dispatch', dispatch)
  }
}
