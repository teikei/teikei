import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import type { AdminUser } from '../../domain/entryRecords.ts'
import { createFarmsDomain, type FarmPatch } from '../../domain/farms.ts'
import refreshSearchIndex from '../../hooks/refreshSearchIndex.js'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminFarmsController = (db: Database) => {
  const farms = createFarmsDomain(db)

  return {
    find: (params: AdminParams) =>
      farms.listAdmin(params.query ?? {}, params.user),
    get: (id: Id, params: Params) =>
      farms.getAdmin(id, params.query?.$details === 'true'),
    create: (data: unknown) => farms.createAdmin(data),
    patch: (id: Id, data: FarmPatch) => farms.patch(id, data),
    remove: (id: Id) => farms.remove(id)
  }
}

export default (app: Application) => {
  app.use('/admin/farms', createAdminFarmsController(app.get('kysely')))
  app.service('admin/farms').hooks({
    after: { all: [refreshSearchIndex] }
  })
}
