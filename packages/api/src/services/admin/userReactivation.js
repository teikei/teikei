import { disallow } from 'feathers-hooks-common'

import filterAllowedFields from '../../hooks/filterAllowedFields'
import { BadRequest } from '@feathersjs/errors'
import { reactivateUser } from '../../hooks/reactivateUser'

export default (app) => {
  const service = {
    create: async (params) => {
      const { id } = params
      if (id === undefined) {
        throw new BadRequest('id must be present for user reactivation.')
      }
      const { state } = await app.service('users').get(id)
      if (state !== 'RECENT_LOGIN') {
        await reactivateUser(app, id)
        return 'User reactivated.'
      } else {
        throw new BadRequest(
          'User is already active, no reactivation required.',
        )
      }
    },
  }
  app.use('/admin/user-reactivation', service)

  app.service('/admin/user-reactivation').hooks({
    before: {
      find: [disallow()],
      get: [disallow()],
      update: [disallow()],
      patch: [disallow()],
      remove: [disallow()],
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      update: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields],
    },
  })
}
