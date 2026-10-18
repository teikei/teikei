import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Badges } from '../../db/types.ts'
import { createBadgesDomain, type BadgesDomain } from '../../domain/badges.ts'

const createAdminBadgesController = (badges: BadgesDomain) => ({
  find: (params: Params) => badges.list(params.query ?? {}),
  get: (id: Id) => badges.get(id),
  create: (data: Insertable<Badges>) => badges.create(data),
  patch: (id: Id, data: Updateable<Badges>) => badges.patch(id, data),
  remove: (id: Id) => badges.remove(id)
})

export default (app: Application) => {
  app.use(
    '/admin/badges',
    createAdminBadgesController(createBadgesDomain(app.get('kysely')))
  )
}
