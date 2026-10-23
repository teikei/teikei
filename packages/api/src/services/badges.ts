import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createBadgesDomain } from '../domain/badges.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { toBadge } from './serializers.ts'

const createBadgesController = (db: Database) => {
  const badges = createBadgesDomain(db)

  return {
    find: async (params: Params) =>
      (await badges.listAll(params.query ?? {})).map(toBadge),
    get: async (id: Id) => toBadge(await badges.get(String(id)))
  }
}

export default (app: Application) => {
  app.use('/badges', createBadgesController(app.get('kysely')))
  app.service('badges').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
