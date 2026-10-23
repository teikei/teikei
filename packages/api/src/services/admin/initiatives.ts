import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import type { AdminUser } from '../../domain/entryRules.ts'
import {
  createInitiativesDomain,
  type InitiativePatch
} from '../../domain/initiatives.ts'
import { fromRequest, toInitiative, toPage } from '../serializers.ts'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminInitiativesController = (db: Database) => {
  const initiatives = createInitiativesDomain(db)

  return {
    find: async ({ query: { $details, ...query } = {}, user }: AdminParams) =>
      toPage(
        await initiatives.listAdmin(query, {
          details: $details === 'true',
          user
        }),
        toInitiative
      ),
    get: async (id: Id, params: Params) =>
      toInitiative(
        await initiatives.getAdmin(
          String(id),
          params.query?.$details === 'true'
        )
      ),
    create: async (data: object) =>
      toInitiative(await initiatives.createAdmin(fromRequest(data))),
    patch: async (id: Id, data: InitiativePatch) =>
      toInitiative(await initiatives.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toInitiative(await initiatives.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use(
    '/admin/initiatives',
    createAdminInitiativesController(app.get('kysely'))
  )
  app.service('admin/initiatives').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
