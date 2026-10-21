import { mapDatabaseErrors } from '../../db/errors.ts'
import { createUsersDomain } from '../../domain/users.ts'

export default (app) => {
  const users = createUsersDomain(app.get('kysely'))

  app.use('/admin/bounces', {
    find: (params) => users.listBounces(params.user)
  })
  app.service('admin/bounces').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
