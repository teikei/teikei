import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import type { AdminUser } from '../../domain/entryRules.ts'
import { createUsersDomain, type AdminUserPatch } from '../../domain/users.ts'
import { toPage, toUser } from '../serializers.ts'

// Set by the authentication hook.
type AdminParams = Params & { user?: AdminUser & { id: string } }

const createAdminUsersController = (db: Database) => {
  const users = createUsersDomain(db)

  return {
    find: async ({ query = {}, user }: AdminParams) => {
      const { $details, 'roles.id': withRole, ...rest } = query
      const page = await users.listAdmin(rest, {
        details: $details === 'true',
        user,
        withRole
      })
      return toPage(page, toUser)
    },
    get: async (id: Id, params: Params) =>
      toUser(
        await users.getAdmin(String(id), params.query?.$details === 'true')
      ),
    create: async (data: unknown) => toUser(await users.createAdmin(data)),
    patch: async (id: Id, data: AdminUserPatch) =>
      toUser(await users.patchAdmin(String(id), data)),
    remove: async (id: Id) => toUser(await users.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/users', createAdminUsersController(app.get('kysely')))
  app.service('admin/users').hooks({
    error: { all: [mapDatabaseErrors] }
  })

  app.use('/admin/users/:userId/entries', {
    find(params: Params) {
      return app.service('admin/entries').find({
        query: {
          userId: params.route?.userId
        }
      })
    }
  })
}
