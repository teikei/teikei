import type { Application, Id, Params } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import type { Database } from '../../db/kysely.ts'
import type { Goals } from '../../db/types.ts'
import { createGoalsDomain } from '../../domain/goals.ts'

const createAdminGoalsController = (db: Database) => {
  const goals = createGoalsDomain(db)

  return {
    find: (params: Params) => goals.list(params.query ?? {}),
    get: (id: Id) => goals.get(id),
    create: (data: Insertable<Goals>) => goals.create(data),
    patch: (id: Id, data: Updateable<Goals>) => goals.patch(id, data)
  }
}

export default (app: Application) => {
  app.use('/admin/goals', createAdminGoalsController(app.get('kysely')))
}
