import type { Application, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { AdminUser } from '../../domain/entryRules.ts'
import { createUsersDomain } from '../../domain/users.ts'

// Set by the authentication hook; only admins are authorized for bounces.
type AdminParams = Params & { user: AdminUser }

export default (app: Application) => {
  const users = createUsersDomain(app.get('kysely'))

  app.use('/admin/bounces', {
    find: (params: AdminParams) => users.listBounces(params.user)
  })
  app.service('admin/bounces').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
