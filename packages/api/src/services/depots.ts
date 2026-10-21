import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createDepotsDomain, type DepotPatch } from '../domain/depots.ts'
import { sendNewEntryNotification } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import refreshSearchIndex from '../hooks/refreshSearchIndex.js'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createDepotsController = (db: Database) => {
  const depots = createDepotsDomain(db)

  return {
    find: (params: Params) => depots.list(params.query ?? {}),
    get: (id: Id) => depots.get(id),
    create: (data: unknown, params: UserParams) =>
      depots.create(data, params.user?.id),
    patch: (id: Id, data: DepotPatch) => depots.patch(id, data),
    remove: (id: Id) => depots.remove(id)
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
    }
  })
}
