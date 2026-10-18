import type { Application, Id, Params } from '@feathersjs/feathers'
import { createRolesDomain, type RolesDomain } from '../../domain/roles.ts'

const createAdminRolesController = (roles: RolesDomain) => ({
  find: (params: Params) => roles.list(params.query ?? {}),
  get: (id: Id) => roles.get(id)
})

export default (app: Application) => {
  app.use(
    '/admin/roles',
    createAdminRolesController(createRolesDomain(app.get('kysely')))
  )
}
