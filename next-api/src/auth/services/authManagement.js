import { hooks as authHooks } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'

import { restrictToUser } from '../hooks/authorization'

const isAction = (...args) => hook => args.includes(hook.data.action)

export default app => {
  app.configure(
    authManagement({
      notifier: (type, user, notifierOptions) => {
        console.log('type', type)
        console.log('user', user)
        console.log('notifierOptions', notifierOptions)
      }
    })
  )

  app.service('authManagement').hooks({
    before: {
      create: [
        iff(
          isAction('passwordChange', 'identityChange'),
          authHooks.authenticate('jwt'),
          restrictToUser
        )
      ]
    }
  })
}
