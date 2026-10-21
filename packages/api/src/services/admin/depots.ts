import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import { createDepotsDomain, type DepotPatch } from '../../domain/depots.ts'
import type { AdminUser } from '../../domain/entryRecords.ts'
import refreshSearchIndex from '../../hooks/refreshSearchIndex.js'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminDepotsController = (db: Database) => {
  const depots = createDepotsDomain(db)

  return {
    find: (params: AdminParams) =>
      depots.listAdmin(params.query ?? {}, params.user),
    get: (id: Id, params: Params) =>
      depots.getAdmin(id, params.query?.$details === 'true'),
    create: (data: unknown) => depots.createAdmin(data),
    patch: (id: Id, data: DepotPatch) => depots.patch(id, data),
    remove: (id: Id) => depots.remove(id)
  }
}

export default (app: Application) => {
  app.use('/admin/depots', createAdminDepotsController(app.get('kysely')))
  app.service('admin/depots').hooks({
    after: { all: [refreshSearchIndex] }
  })
}
