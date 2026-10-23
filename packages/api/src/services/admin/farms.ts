import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import type { AdminUser } from '../../domain/entryRules.ts'
import { createFarmsDomain, type FarmPatch } from '../../domain/farms.ts'
import refreshSearchIndex from '../../hooks/refreshSearchIndex.ts'
import { fromRequest, toFarm, toPage } from '../serializers.ts'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminFarmsController = (db: Database) => {
  const farms = createFarmsDomain(db)

  return {
    find: async ({ query = {}, user }: AdminParams) => {
      const { $details, hasBadge, notHasBadge, ...rest } = query
      const page = await farms.listAdmin(rest, {
        details: $details === 'true',
        user,
        badges: { hasBadge, notHasBadge }
      })
      return toPage(page, toFarm)
    },
    get: async (id: Id, params: Params) =>
      toFarm(
        await farms.getAdmin(String(id), params.query?.$details === 'true')
      ),
    create: async (data: object) =>
      toFarm(await farms.createAdmin(fromRequest(data))),
    patch: async (id: Id, data: FarmPatch) =>
      toFarm(await farms.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toFarm(await farms.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/farms', createAdminFarmsController(app.get('kysely')))
  app.service('admin/farms').hooks({
    after: { all: [refreshSearchIndex] },
    error: { all: [mapDatabaseErrors] }
  })
}
