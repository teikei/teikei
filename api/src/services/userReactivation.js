import { disallow } from 'feathers-hooks-common'

import filterAllowedFields from '../hooks/filterAllowedFields'
import { BadRequest } from '@feathersjs/errors'

export default (app) => {
  const service = {
    create: async (params) => {
      const { id, token } = params
      if (id === undefined || token === undefined) {
        throw new BadRequest(
          'id and token must be present for user reactivation.'
        )
      }
      const { reactivationToken, state } = await app.service('users').get(id)
      if (reactivationToken !== token) {
        throw new BadRequest('Invalid reactivation token.')
      }
      if (state !== 'ACTIVE') {
        await app.service('users').patch(id, {
          state: 'ACTIVE',
          last_login: new Date().toISOString(),
          reminder_sent_at: null,
          second_reminder_sent_at: null,
          reactivationToken: null,
        })
        return 'User reactivated.'
      } else {
        throw new BadRequest(
          'User is already active, no reactivation required.'
        )
      }
    },
  }
  app.use('/user-reactivation', service)

  app
    .service('/user-reactivation')
    .hooks({
      before: {
        all: [],
        find: [disallow()],
        get: [disallow()],
        create: [],
        update: [disallow()],
        patch: [disallow()],
        remove: [disallow()],
      },
      after: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
      error: {
        all: [],
        find: [],
        get: [],
        create: [],
        patch: [],
        remove: [],
      },
    })
    .hooks({
      after: {
        all: [filterAllowedFields],
      },
    })
}
