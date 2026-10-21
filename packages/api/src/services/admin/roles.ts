import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createRolesDomain } from '../../domain/roles.ts'
import { toPage, toRole } from '../serializers.ts'

const createAdminRolesController = (db: Database) => {
  const roles = createRolesDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await roles.list(params.query ?? {}), toRole),
    get: async (id: Id) => toRole(await roles.get(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/roles', createAdminRolesController(app.get('kysely')))
  app.service('admin/roles').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
