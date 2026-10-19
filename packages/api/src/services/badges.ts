import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createBadgesDomain } from '../domain/badges.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createBadgesController = (db: Database) => {
  const badges = createBadgesDomain(db)

  return {
    find: (params: Params) => badges.listAll(params.query ?? {}),
    get: (id: Id) => badges.get(id)
  }
}

export default (app: Application) => {
  app.use('/badges', createBadgesController(app.get('kysely')))
  app.service('badges').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
