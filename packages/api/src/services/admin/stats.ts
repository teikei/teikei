import type { Application } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createStatsDomain } from '../../domain/stats.ts'

const createAdminStatsController = (db: Database) => {
  const stats = createStatsDomain(db)

  return {
    find: () => stats.list()
  }
}

export default (app: Application) => {
  app.use('/admin/stats', createAdminStatsController(app.get('kysely')))
  app.service('admin/stats').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
