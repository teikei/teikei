import { BadRequest } from '@feathersjs/errors'
import type { Application, Id } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'
import { mapDatabaseErrors } from '../../db/errors.ts'
import filterAllowedFields from '../../hooks/filterAllowedFields.ts'
import { setAccountActive } from '../../hooks/userAccountActions.ts'

export default (app: Application) => {
  const service = {
    create: async (params: { id?: Id; active?: boolean }) => {
      const { id, active } = params
      if (id === undefined || active === undefined) {
        throw new BadRequest(
          'id and active flag must be present for user account state change.'
        )
      }
      await setAccountActive(app, id, active)
      return 'User reactivated.'
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
    },
    error: { all: [mapDatabaseErrors] }
  })
}
