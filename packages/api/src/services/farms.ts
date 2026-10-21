import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createFarmsDomain, type FarmPatch } from '../domain/farms.ts'
import { sendNewEntryNotification } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import refreshSearchIndex from '../hooks/refreshSearchIndex.js'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createFarmsController = (db: Database) => {
  const farms = createFarmsDomain(db)

  return {
    find: (params: Params) => farms.list(params.query ?? {}),
    get: (id: Id) => farms.get(id),
    create: (data: unknown, params: UserParams) =>
      farms.create(data, params.user?.id),
    patch: (id: Id, data: FarmPatch) => farms.patch(id, data),
    remove: (id: Id) => farms.remove(id)
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
    }
  })
}
