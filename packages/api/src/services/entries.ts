import type { Application, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createEntriesDomain } from '../domain/entries.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createEntriesController = (db: Database) => {
  const entries = createEntriesDomain(db)

  return {
    find: ({ query = {}, user }: UserParams) =>
      'mine' in query
        ? entries.listOwned(user?.id, query)
        : entries.listActive()
  }
}

export default (app: Application) => {
  app.use('/entries', createEntriesController(app.get('kysely')))
  app.service('entries').hooks({
    after: {
      find: [filterAllowedFields, toGeoJSON()]
    }
  })
}
