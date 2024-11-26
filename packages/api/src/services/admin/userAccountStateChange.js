import { BadRequest } from '@feathersjs/errors'
import { disallow } from 'feathers-hooks-common'
import filterAllowedFields from '../../hooks/filterAllowedFields'
import {
  updateUserEntriesActiveState,
  updateUserState
} from '../../hooks/userAccountActions'

export default (app) => {
  const service = {
    create: async (params) => {
      const { id, active } = params
      if (id === undefined || active === undefined) {
        throw new BadRequest(
          'id and active flag must be present for user account state change.'
        )
      }
      const userId = await app.service('users').get(id)
      if (userId !== undefined) {
        await updateUserState(app, id, active)
        await updateUserEntriesActiveState(app, id, active)
        return 'User reactivated.'
      } else {
        throw new BadRequest(`cannot find user with id ${id}`)
      }
    }
  }
  app.use('/admin/user-account-state-change', service)

  app.service('/admin/user-account-state-change').hooks({
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
      update: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields]
    }
  })
}
