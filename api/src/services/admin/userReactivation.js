import { disallow } from 'feathers-hooks-common'

import filterAllowedFields from '../../hooks/filterAllowedFields'
import { BadRequest } from '@feathersjs/errors'

export default (app) => {
  const service = {
    create: async (params) => {
      const { id } = params
      if (id === undefined) {
        throw new BadRequest('id must be present for user reactivation.')
      }
      const { state } = await app.service('users').get(id)
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
  app.use('/admin/user-reactivation', service)

  app
    .service('/admin/user-reactivation')
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
