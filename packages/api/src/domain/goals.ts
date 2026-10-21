import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createGoalsRepository,
  type GoalChanges,
  type GoalValues
} from '../repositories/goals.ts'

export const createGoalsDomain = (db: Database) => {
  const goals = createGoalsRepository(db)

  const get = async (id: string) => {
    const row = await goals.findById(id)
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    get,

    listAll: (query: ListQuery) => goals.findAll(query),

    list: (query: ListQuery) => goals.find(query),

    create: (input: GoalValues) => goals.insert(input),

    patch: async (id: string, input: GoalChanges) => {
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(input).length === 0) {
        return get(id)
      }
      const row = await goals.update(id, input)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
