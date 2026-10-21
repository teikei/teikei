import type { Application, Params } from '@feathersjs/feathers'
import type { Database } from '../../db/kysely.ts'
import { createEntriesDomain } from '../../domain/entries.ts'

const createAdminEntriesController = (db: Database) => {
  const entries = createEntriesDomain(db)

  return {
    find: (params: Params) => entries.listForAdmin(params.query?.userId)
  }
}

export default (app: Application) => {
  app.use('/admin/entries', createAdminEntriesController(app.get('kysely')))
}
