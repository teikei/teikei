import type { Selectable } from 'kysely'
import type { Database } from '../db/kysely.ts'
import type { Goals } from '../db/types.ts'

export type GoalRow = Selectable<Goals>

export const createGoalsRepository = (db: Database) => ({
  findAll: (trx: Database = db) =>
    trx.selectFrom('goals').selectAll().execute(),

  findById: (id: string, trx: Database = db) =>
    trx.selectFrom('goals').selectAll().where('id', '=', id).executeTakeFirst()
})
