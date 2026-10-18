import type { Application, Id, Params } from '@feathersjs/feathers'
import { createRolesService, type RolesService } from '../../domain/roles.ts'

class AdminRolesController {
  roles: RolesService

  constructor(roles: RolesService) {
    this.roles = roles
  }

  find(params: Params) {
    return this.roles.list(params.query ?? {})
  }

  get(id: Id) {
    return this.roles.get(id)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/roles',
    new AdminRolesController(createRolesService(app.get('kysely')))
  )
}
