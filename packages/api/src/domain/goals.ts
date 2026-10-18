import { NotFound } from '@feathersjs/errors'
import type { Id } from '@feathersjs/feathers'
import { withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import { createGoalsRepository, type GoalRow } from '../repositories/goals.ts'

export type Goal = GoalRow & { type: 'Goal'; link: string }

const toGoal = (row: GoalRow): Goal => ({
  ...row,
  type: 'Goal',
  link: `/goals/${row.id}`
})

export const createGoalsService = (db: Database) => {
  const goals = createGoalsRepository(db)

  return {
    list: async () => (await withFeathersErrors(goals.findAll())).map(toGoal),

    get: async (id: Id) => {
      const row = await withFeathersErrors(goals.findById(String(id)))
      if (!row) {
        throw new NotFound(`No record found for id '${id}'`)
      }
      return toGoal(row)
    }
  }
}

export type GoalsService = ReturnType<typeof createGoalsService>
