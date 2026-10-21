import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createGoalsDomain } from '../../domain/goals.ts'
import type { GoalChanges, GoalValues } from '../../repositories/goals.ts'
import { toGoal, toPage } from '../serializers.ts'

const createAdminGoalsController = (db: Database) => {
  const goals = createGoalsDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await goals.list(params.query ?? {}), toGoal),
    get: async (id: Id) => toGoal(await goals.get(String(id))),
    create: async (data: GoalValues) => toGoal(await goals.create(data)),
    patch: async (id: Id, data: GoalChanges) =>
      toGoal(await goals.patch(String(id), data))
  }
}

export default (app: Application) => {
  app.use('/admin/goals', createAdminGoalsController(app.get('kysely')))
  app.service('admin/goals').hooks({
    error: { all: [mapDatabaseErrors] }
  })
}
