import pino from 'pino'
import pinoExpress from 'express-pino-logger'
import logger from 'feathers-logger'

export default app => {
  app.configure(logger(pino()))
  app.use(pinoExpress())
}

export const loggerHook = () => context => {
  const { app } = context

  app.info(`${context.type} app.service('${context.path}').${context.method}()`)

  if (typeof context.toJSON === 'function') {
    app.debug('Hook Context', context)
  }

  if (context.error) {
    app.error(context.error)
  }
}
