import { hooks as authHooks } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields'

const isAction = (...args) => (hook) => args.includes(hook.data.action)

export default (app) => {
  app.configure(
    authManagement({
      notifier: (type, user) => {
        switch (type) {
          case 'sendResetPwd':
            app.service('emails').create({
              template: 'reset_password_instructions',
              message: {
                to: user.email,
              },
              locals: {
                // locale: 'en'
                user,
                sender_email: 'kontakt@ernte-teilen.org',
              },
            })
            break
          default:
            app.error('unknown authentication management has been called.')
        }
      },
    })
  )

  app
    .service('authManagement')
    .hooks({
      before: {
        all: [],
        create: [
          iff(
            isAction('passwordChange', 'identityChange'),
            authHooks.authenticate('jwt')
          ),
        ],
      },
      after: {
        all: [],
        create: [],
      },
      error: {
        all: [],
        create: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
