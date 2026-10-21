import type { Application, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createEntriesDomain } from '../../domain/entries.ts'

type Row = { id: string }

// One react-admin resource for all three types, so the type is part of the
// key; react-admin needs no `link`.
const keyed =
  <T extends string>(type: T) =>
  (row: Row) => ({ ...row, type, id: `${type}_${row.id}`, _id: row.id })

const createAdminEntriesController = (db: Database) => {
  const entries = createEntriesDomain(db)

  return {
    find: async (params: Params) => {
      const { farms, depots, initiatives } = await entries.listForAdmin(
        params.query?.userId
      )
      return [
        ...farms.map(keyed('Farm')),
        ...depots.map(keyed('Depot')),
        ...initiatives.map(keyed('Initiative'))
      ]
    }
  }
}

export default (app: Application) => {
  app.use('/admin/entries', createAdminEntriesController(app.get('kysely')))
  app.service('admin/entries').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
