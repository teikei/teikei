import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Goals } from '../../db/types.ts'
import { createGoalsDomain, type GoalsDomain } from '../../domain/goals.ts'

const createAdminGoalsController = (goals: GoalsDomain) => ({
  find: (params: Params) => goals.list(params.query ?? {}),
  get: (id: Id) => goals.get(id),
  create: (data: Insertable<Goals>) => goals.create(data),
  patch: (id: Id, data: Updateable<Goals>) => goals.patch(id, data)
})

export default (app: Application) => {
  app.use(
    '/admin/goals',
    createAdminGoalsController(createGoalsDomain(app.get('kysely')))
  )
}
