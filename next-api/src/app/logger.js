import pino from 'pino'
import pinoExpress from 'express-pino-logger'
import logger from 'feathers-logger'

export default app => {
  const pinoLogger = pino()
  pinoLogger.level = process.env.NODE_ENV !== 'PRODUCTION' ? 'debug' : 'warn'
  app.configure(logger(pinoLogger))
  app.use(pinoExpress())
  app.info(process.env.NODE_ENV)
}

export const loggerHook = context => {
  const { app } = context

  app.info(`${context.type} app.service('${context.path}').${context.method}()`)

  if (typeof context.toJSON === 'function') {
    app.debug('Hook Context', context)
  }

  if (context.error) {
    app.error('error', context.error)
  }
}
