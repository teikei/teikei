import { authenticate } from '@feathersjs/authentication'
import authManagement from 'feathers-authentication-management'
import { iff } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { logger } from '../logger'

const isAction =
  (...args) =>
  (hook) =>
    args.includes(hook.data.action)

export default (app) => {
  app.configure(
    authManagement({
      notifier: (type, user) => {
        switch (type) {
          case 'sendResetPwd':
            app.service('emails').create({
              template: 'reset_password_instructions',
              message: {
                to: user.email
              },
              locals: {
                locale: user.locale,
                user,
                sender_email: 'kontakt@ernte-teilen.org'
              }
            })
            break
          default:
            logger.error('unknown authentication management has been called.')
        }
      }
    })
  )

  app.service('authManagement').hooks({
    before: {
      create: [
        iff(isAction('passwordChange', 'identityChange'), authenticate('jwt'))
      ]
    },
    after: {
      create: [filterAllowedFields]
    }
  })
}
