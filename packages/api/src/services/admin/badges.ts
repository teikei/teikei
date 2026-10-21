import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createBadgesDomain } from '../../domain/badges.ts'
import type { BadgeChanges, BadgeValues } from '../../repositories/badges.ts'
import { toBadge, toPage } from '../serializers.ts'

const createAdminBadgesController = (db: Database) => {
  const badges = createBadgesDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await badges.list(params.query ?? {}), toBadge),
    get: async (id: Id) => toBadge(await badges.get(String(id))),
    create: async (data: BadgeValues) => toBadge(await badges.create(data)),
    patch: async (id: Id, data: BadgeChanges) =>
      toBadge(await badges.patch(String(id), data)),
    remove: async (id: Id) => toBadge(await badges.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/admin/badges', createAdminBadgesController(app.get('kysely')))
  app.service('admin/badges').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
