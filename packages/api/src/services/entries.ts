import type { Application, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createEntriesDomain } from '../domain/entries.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import { toDepot, toFarm, toInitiative } from './serializers.ts'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

type Row = { id: string }

const merge = ({
  farms,
  depots,
  initiatives
}: {
  farms: Row[]
  depots: Row[]
  initiatives: Row[]
}) => [
  ...farms.map(toFarm),
  ...depots.map(toDepot),
  ...initiatives.map(toInitiative)
]

const createEntriesController = (db: Database) => {
  const entries = createEntriesDomain(db)

  return {
    find: async ({ query = {}, user }: UserParams) =>
      merge(
        'mine' in query
          ? await entries.listOwned(user?.id, {
              type: query.type,
              id: query.id
            })
          : await entries.listActive()
      )
  }
}

export default (app: Application) => {
  app.use('/entries', createEntriesController(app.get('kysely')))
  app.service('entries').hooks({
    after: {
      find: [filterAllowedFields, toGeoJSON()]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
