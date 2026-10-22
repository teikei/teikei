import type { Application } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createAuditDomain } from '../../domain/audit.ts'

const createAdminAuditController = (db: Database) => {
  const audit = createAuditDomain(db)

  return {
    find: () => audit.report()
  }
}

export default (app: Application) => {
  app.use('/admin/audit', createAdminAuditController(app.get('kysely')))
  app.service('admin/audit').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
