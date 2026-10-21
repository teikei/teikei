import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createOriginsDomain } from '../../domain/origins.ts'
import { toOrigin, toPage } from '../serializers.ts'

const createAdminOriginsController = (db: Database) => {
  const origins = createOriginsDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await origins.list(params.query ?? {}), toOrigin),
    get: async (id: Id) => toOrigin(await origins.get(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/origins', createAdminOriginsController(app.get('kysely')))
  app.service('admin/origins').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
