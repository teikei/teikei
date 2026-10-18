import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Badges } from '../../db/types.ts'
import { createBadgesService, type BadgesService } from '../../domain/badges.ts'

class AdminBadgesController {
  badges: BadgesService

  constructor(badges: BadgesService) {
    this.badges = badges
  }

  find(params: Params) {
    return this.badges.list(params.query ?? {})
  }

  get(id: Id) {
    return this.badges.get(id)
  }

  create(data: Insertable<Badges>) {
    return this.badges.create(data)
  }

  patch(id: Id, data: Updateable<Badges>) {
    return this.badges.patch(id, data)
  }

  remove(id: Id) {
    return this.badges.remove(id)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/badges',
    new AdminBadgesController(createBadgesService(app.get('kysely')))
  )
}
