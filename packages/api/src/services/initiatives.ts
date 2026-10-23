import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import {
  createInitiativesDomain,
  type InitiativePatch
} from '../domain/initiatives.ts'
import { sendNewEntryNotification } from '../hooks/email.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import toGeoJSON from '../hooks/geoJson.ts'
import refreshSearchIndex from '../hooks/refreshSearchIndex.ts'
import { fromRequest, toInitiative } from './serializers.ts'

// Set by the authentication hook.
type UserParams = Params & { user?: { id: string } }

const createInitiativesController = (db: Database) => {
  const initiatives = createInitiativesDomain(db)

  return {
    find: async ({ query: { $details, ...query } = {} }: Params) =>
      (await initiatives.list(query, { details: $details === 'true' })).map(
        toInitiative
      ),
    get: async (id: Id) => toInitiative(await initiatives.get(String(id))),
    create: async (data: object, params: UserParams) =>
      toInitiative(
        await initiatives.create(fromRequest(data), params.user?.id)
      ),
    patch: async (id: Id, data: InitiativePatch) =>
      toInitiative(await initiatives.patch(String(id), fromRequest(data))),
    remove: async (id: Id) => toInitiative(await initiatives.remove(String(id)))
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
    },
    error: { all: [mapDatabaseErrors] }
  })
}
