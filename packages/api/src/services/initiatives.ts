import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import {
  createInitiativesDomain,
  type InitiativePatch
} from '../domain/initiatives.ts'
import { sendNewEntryNotification } from '../hooks/email.js'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import refreshSearchIndex from '../hooks/refreshSearchIndex.js'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createInitiativesController = (db: Database) => {
  const initiatives = createInitiativesDomain(db)

  return {
    find: (params: Params) => initiatives.list(params.query ?? {}),
    get: (id: Id) => initiatives.get(id),
    create: (data: unknown, params: UserParams) =>
      initiatives.create(data, params.user?.id),
    patch: (id: Id, data: InitiativePatch) => initiatives.patch(id, data),
    remove: (id: Id) => initiatives.remove(id)
  }
}

export default (app: Application) => {
  app.use('/initiatives', createInitiativesController(app.get('kysely')))

  // filterAllowedFields reads the flat records, so GeoJSON comes last.
  const after = [filterAllowedFields, refreshSearchIndex, toGeoJSON()]
  app.service('initiatives').hooks({
    after: {
      find: after,
      get: after,
      create: [sendNewEntryNotification, ...after],
      patch: after,
      remove: after
    }
  })
}
