import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Database } from '../db/kysely.ts'
import { createGoalsDomain } from '../domain/goals.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createGoalsController = (db: Database) => {
  const goals = createGoalsDomain(db)

  return {
    find: (params: Params) => goals.listAll(params.query ?? {}),
    get: (id: Id) => goals.get(id)
  }
}

export default (app: Application) => {
  app.use('/goals', createGoalsController(app.get('kysely')))
  app.service('goals').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
