import logger from 'feathers-logger'
import studioLogger from '@studio/log'
import x from '@studio/log-x'
import Stringify from '@studio/ndjson/stringify'

export default app => {
  studioLogger
    .pipe(x('params.headers.authorization'))
    .pipe(x('params.user.password'))
    .pipe(x('authentication.secret'))
    .pipe(x('service.passport._feathers.jwt.secret'))
    .pipe(x('service.passport._feathers.jwt.secretOrKey'))
    .pipe(x('data.accessToken'))
    .pipe(new Stringify())
    .pipe(process.stdout)

  const teikeiLogger = studioLogger('teikei-api')

  // map studo log topics to feathers log levels
  teikeiLogger.info = teikeiLogger.ok
  teikeiLogger.log = teikeiLogger.ok
  teikeiLogger.debug = teikeiLogger.ignore

  app.configure(logger(teikeiLogger))
}

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  if (type === 'error') {
    app.error(`${type} app.service('${path}').${method}()`)
  } else app.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    app.debug('context', context)
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
    app.debug('debug info:')
    app.debug('context.params', params)
    app.debug('context.data', data)
    app.debug('context.result', result)
    app.debug('context.dispatch', dispatch)
  }
}
