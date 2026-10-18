import type { Application, Id } from '@feathersjs/feathers'
import { createGoalsDomain, type GoalsDomain } from '../domain/goals.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

const createGoalsController = (goals: GoalsDomain) => ({
  find: () => goals.listAll(),
  get: (id: Id) => goals.get(id)
})

export default (app: Application) => {
  app.use('/goals', createGoalsController(createGoalsDomain(app.get('kysely'))))
  app.service('goals').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
