import { disallow } from 'feathers-hooks-common'

import { BadRequest } from '@feathersjs/errors'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { resetUserLoginActivityState } from '../hooks/userAccountActions'

export default (app) => {
  const service = {
    create: async (params) => {
      const { id, token } = params
      if (id === undefined || token === undefined) {
        throw new BadRequest(
          'id and token must be present for user login reset.'
        )
      }
      const { reactivationToken, state } = await app.service('users').get(id)
      if (state === 'RECENT_LOGIN') {
        return 'User is active, no login state reset required.'
      }
      if (reactivationToken !== token) {
        throw new BadRequest('Invalid reactivation token.')
      }
      await resetUserLoginActivityState(app, id)
      return 'User login recorded, state has been reset.'
    }
  }
  app.use('/user-reactivation', service)

  app.service('/user-reactivation').hooks({
    before: {
      find: [disallow()],
      get: [disallow()],
      update: [disallow()],
      patch: [disallow()],
      remove: [disallow()]
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    }
  })
}
