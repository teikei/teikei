import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Updateable } from 'kysely'
import { notFound, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { Goals } from '../db/types.ts'
import { createGoalsRepository, type GoalRow } from '../repositories/goals.ts'

export type Goal = GoalRow & { type: 'Goal'; link: string }

const toGoal = (row: GoalRow): Goal => ({
  ...row,
  type: 'Goal',
  link: `/goals/${row.id}`
})

export const createGoalsDomain = (db: Database) => {
  const goals = createGoalsRepository(db)

  const get = async (id: Id) => {
    const row = await withFeathersErrors(goals.findById(String(id)))
    if (!row) {
      throw notFound(id)
    }
    return toGoal(row)
  }

  return {
    get,

    listAll: async () =>
      (await withFeathersErrors(goals.findAll())).map(toGoal),

    list: async (query: Query) => {
      const page = await withFeathersErrors(goals.find(query))
      return { ...page, data: page.data.map(toGoal) }
    },

    create: async (input: Insertable<Goals>) =>
      toGoal(await withFeathersErrors(goals.insert(input))),

    patch: async (id: Id, input: Updateable<Goals>) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await withFeathersErrors(goals.update(String(id), input))
      if (!row) {
        throw notFound(id)
      }
      return toGoal(row)
    }
  }
}

export type GoalsDomain = ReturnType<typeof createGoalsDomain>
