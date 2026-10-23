import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createDepotsDomain, type DepotPatch } from '../domain/depots.ts'
import { sendNewEntryNotification } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import refreshSearchIndex from '../hooks/refreshSearchIndex.js'
import { fromRequest, toDepot } from './serializers.ts'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createDepotsController = (db: Database) => {
  const depots = createDepotsDomain(db)

  return {
    find: async ({ query: { $details, ...query } = {} }: Params) =>
      (await depots.list(query, { details: $details === 'true' })).map(toDepot),
    get: async (id: Id) => toDepot(await depots.get(String(id))),
    create: async (data: object, params: UserParams) =>
      toDepot(await depots.create(fromRequest(data), params.user?.id)),
    patch: async (id: Id, data: DepotPatch) =>
      toDepot(await depots.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toDepot(await depots.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/depots', createDepotsController(app.get('kysely')))

  // filterAllowedFields reads the flat records, so GeoJSON comes last.
  const after = [filterAllowedFields, refreshSearchIndex, toGeoJSON('farms')]
  app.service('depots').hooks({
    after: {
      find: after,
      get: after,
      create: [sendNewEntryNotification, ...after],
      patch: after,
      remove: after
    },
    error: { all: [mapDatabaseErrors] }
  })
}
