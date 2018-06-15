import { hooks as authHooks } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'

import { restrictToUser } from '../hooks/authorization'

const isAction = (...args) => hook => args.includes(hook.data.action)

export default app => {
  app.configure(
    authManagement({
      notifier: (type, user, notifierOptions) => {
        switch (type) {
          case 'sendResetPwd':
            app.service('emails').create({
              template: 'reset_password_instructions',
              to: user.email,
              locals: {
                // locale: 'en'
                user,
                sender_email: 'kontakt@ernte-teilen.org'
              }
            })
          default:
            app.error('unknown authentication management has been called.')
        }
        console.log('type', type)
        console.log('user', user)
        console.log('notifierOptions', notifierOptions)
      }
    })
  )

  app.service('authManagement').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [
        iff(
          isAction('passwordChange', 'identityChange'),
          authHooks.authenticate('jwt'),
          restrictToUser
        )
      ],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
