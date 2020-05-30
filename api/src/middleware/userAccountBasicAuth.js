import basicAuth from 'express-basic-auth'
import { Ability } from '@casl/ability'

const userAccountAuthorizer = (app) => async (email, password, cb) => {
  try {
    const auth = await app
      .service('authentication')
      .create({ email, password, strategy: 'local' }, { provider: 'rest' })
    const ability = new Ability(auth.abilities)
    return cb(null, ability.can('read', 'arena'))
  } catch (e) {
    app.info('basic auth failed', e)
    return cb(null, false)
  }
}

export default (app) =>
  basicAuth({
    authorizer: userAccountAuthorizer(app),
    challenge: true,
    authorizeAsync: true,
  })
