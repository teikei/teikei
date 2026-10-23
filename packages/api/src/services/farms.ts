import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createFarmsDomain, type FarmPatch } from '../domain/farms.ts'
import { sendNewEntryNotification } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import refreshSearchIndex from '../hooks/refreshSearchIndex.js'
import { fromRequest, toFarm } from './serializers.ts'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createFarmsController = (db: Database) => {
  const farms = createFarmsDomain(db)

  return {
    find: async ({ query: { $details, ...query } = {} }: Params) =>
      (await farms.list(query, { details: $details === 'true' })).map(toFarm),
    get: async (id: Id) => toFarm(await farms.get(String(id))),
    create: async (data: object, params: UserParams) =>
      toFarm(await farms.create(fromRequest(data), params.user?.id)),
    patch: async (id: Id, data: FarmPatch) =>
      toFarm(await farms.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toFarm(await farms.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use('/farms', createFarmsController(app.get('kysely')))

  // filterAllowedFields reads the flat records, so GeoJSON comes last.
  const after = [filterAllowedFields, refreshSearchIndex, toGeoJSON('depots')]
  app.service('farms').hooks({
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
