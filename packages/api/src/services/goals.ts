import type { Application, Id } from '@feathersjs/feathers'
import { createGoalsService, type GoalsService } from '../domain/goals.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.js'

class GoalsController {
  goals: GoalsService

  constructor(goals: GoalsService) {
    this.goals = goals
  }

  find() {
    return this.goals.list()
  }

  get(id: Id) {
    return this.goals.get(id)
  }
}

export default (app: Application) => {
  app.use('/goals', new GoalsController(createGoalsService(app.get('kysely'))))
  app.service('goals').hooks({
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields]
    }
  })
}
