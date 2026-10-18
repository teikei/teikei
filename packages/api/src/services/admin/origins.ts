import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import { createOriginsDomain } from '../../domain/origins.ts'

const createAdminOriginsController = (db: Database) => {
  const origins = createOriginsDomain(db)

  return {
    find: (params: Params) => origins.list(params.query ?? {}),
    get: (id: Id) => origins.get(id)
  }
}

export default (app: Application) => {
  app.use('/admin/origins', createAdminOriginsController(app.get('kysely')))
}
