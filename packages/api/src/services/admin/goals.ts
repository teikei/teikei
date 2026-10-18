import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Goals } from '../../db/types.ts'
import { createGoalsService, type GoalsService } from '../../domain/goals.ts'

class AdminGoalsController {
  goals: GoalsService

  constructor(goals: GoalsService) {
    this.goals = goals
  }

  find(params: Params) {
    return this.goals.list(params.query ?? {})
  }

  get(id: Id) {
    return this.goals.get(id)
  }

  create(data: Insertable<Goals>) {
    return this.goals.create(data)
  }

  patch(id: Id, data: Updateable<Goals>) {
    return this.goals.patch(id, data)
  }
}

export default (app: Application) => {
  app.use(
    '/admin/goals',
    new AdminGoalsController(createGoalsService(app.get('kysely')))
  )
}
