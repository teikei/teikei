import type { Application, Id, Params } from '@feathersjs/feathers'
import {
  createOriginsDomain,
  type OriginsDomain
} from '../../domain/origins.ts'

const createAdminOriginsController = (origins: OriginsDomain) => ({
  find: (params: Params) => origins.list(params.query ?? {}),
  get: (id: Id) => origins.get(id)
})

export default (app: Application) => {
  app.use(
    '/admin/origins',
    createAdminOriginsController(createOriginsDomain(app.get('kysely')))
  )
}
