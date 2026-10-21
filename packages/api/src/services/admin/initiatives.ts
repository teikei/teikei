import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import type { AdminUser } from '../../domain/entryRecords.ts'
import {
  createInitiativesDomain,
  type InitiativePatch
} from '../../domain/initiatives.ts'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser }

const createAdminInitiativesController = (db: Database) => {
  const initiatives = createInitiativesDomain(db)

  return {
    find: (params: AdminParams) =>
      initiatives.listAdmin(params.query ?? {}, params.user),
    get: (id: Id, params: Params) =>
      initiatives.getAdmin(id, params.query?.$details === 'true'),
    create: (data: unknown) => initiatives.createAdmin(data),
    patch: (id: Id, data: InitiativePatch) => initiatives.patch(id, data),
    remove: (id: Id) => initiatives.remove(id)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/initiatives',
    createAdminInitiativesController(app.get('kysely'))
  )
}
