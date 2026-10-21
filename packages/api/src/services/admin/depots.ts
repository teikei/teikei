import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createDepotsDomain, type DepotPatch } from '../../domain/depots.ts'
import type { AdminUser } from '../../domain/entryRules.ts'
import refreshSearchIndex from '../../hooks/refreshSearchIndex.js'
import { toDepot, toPage } from '../serializers.ts'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminDepotsController = (db: Database) => {
  const depots = createDepotsDomain(db)

  return {
    find: async ({ query: { $details, ...query } = {}, user }: AdminParams) =>
      toPage(
        await depots.listAdmin(query, { details: $details === 'true', user }),
        toDepot
      ),
    get: async (id: Id, params: Params) =>
      toDepot(
        await depots.getAdmin(String(id), params.query?.$details === 'true')
      ),
    create: async (data: unknown) => toDepot(await depots.createAdmin(data)),
    patch: async (id: Id, data: DepotPatch) =>
      toDepot(await depots.patch(String(id), data)),
    remove: async (id: Id) => toDepot(await depots.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/depots', createAdminDepotsController(app.get('kysely')))
  app.service('admin/depots').hooks({
    after: { all: [refreshSearchIndex] },
    error: { all: [mapDatabaseErrors] }
  })
}
