import type { Application, Id } from '@feathersjs/feathers'
import { createBadgesService, type BadgesService } from '../domain/badges.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

class BadgesController {
  badges: BadgesService

  constructor(badges: BadgesService) {
    this.badges = badges
  }

  find() {
    return this.badges.listAll()
  }

  get(id: Id) {
    return this.badges.get(id)
  }
}

export default (app: Application) => {
  app.use(
    '/badges',
    new BadgesController(createBadgesService(app.get('kysely')))
  )
  app.service('badges').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
