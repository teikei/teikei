import type { Application, Id, Params } from '@feathersjs/feathers'
import {
  createOriginsService,
  type OriginsService
} from '../../domain/origins.ts'

class AdminOriginsController {
  origins: OriginsService

  constructor(origins: OriginsService) {
    this.origins = origins
  }

  find(params: Params) {
    return this.origins.list(params.query ?? {})
  }

  get(id: Id) {
    return this.origins.get(id)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/origins',
    new AdminOriginsController(createOriginsService(app.get('kysely')))
  )
}
