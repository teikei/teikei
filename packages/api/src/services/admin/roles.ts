import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import { createRolesDomain } from '../../domain/roles.ts'

const createAdminRolesController = (db: Database) => {
  const roles = createRolesDomain(db)

  return {
    find: (params: Params) => roles.list(params.query ?? {}),
    get: (id: Id) => roles.get(id)
  }
}

export default (app: Application) => {
  app.use('/admin/roles', createAdminRolesController(app.get('kysely')))
}
