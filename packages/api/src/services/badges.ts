import type { Application, Id } from '@feathersjs/feathers'
import { createBadgesDomain, type BadgesDomain } from '../domain/badges.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createBadgesController = (badges: BadgesDomain) => ({
  find: () => badges.listAll(),
  get: (id: Id) => badges.get(id)
})

export default (app: Application) => {
  app.use(
    '/badges',
    createBadgesController(createBadgesDomain(app.get('kysely')))
  )
  app.service('badges').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
