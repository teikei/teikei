import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createGoalsDomain } from '../domain/goals.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import { toGoal } from './serializers.ts'

const createGoalsController = (db: Database) => {
  const goals = createGoalsDomain(db)

  return {
    find: async (params: Params) =>
      (await goals.listAll(params.query ?? {})).map(toGoal),
    get: async (id: Id) => toGoal(await goals.get(String(id)))
  }
}

export default (app: Application) => {
  app.use('/goals', createGoalsController(app.get('kysely')))
  app.service('goals').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
