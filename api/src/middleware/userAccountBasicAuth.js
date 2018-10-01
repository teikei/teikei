import basicAuth from 'express-basic-auth'

const userAccountAuthorizer = app => async (email, password, cb) => {
  try {
    await app
      .service('authentication')
      .create({ email, password, strategy: 'local' }, { provider: 'rest' })
  } catch (e) {
    app.info('basic auth failed', e)
    return cb(null, false)
  }
  return cb(null, true)
}

export default app =>
  basicAuth({
    authorizer: userAccountAuthorizer(app),
    challenge: true,
    authorizeAsync: true
  })
