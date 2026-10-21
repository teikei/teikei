import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findMatching, findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { Goals } from '../db/types.ts'

export type GoalRow = Selectable<Goals>
export type GoalValues = Insertable<Goals>
export type GoalChanges = Updateable<Goals>

const QUERYABLE: (keyof Goals)[] = ['id', 'name']

export const createGoalsRepository = (db: Database) => ({
  findAll: (query: Query, trx: Database = db) =>
    findMatching(trx.selectFrom('goals').selectAll(), query, QUERYABLE),

  find: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('goals').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx.selectFrom('goals').selectAll().where('id', '=', id).executeTakeFirst(),

  insert: (values: GoalValues, trx: Database = db) =>
    trx
      .insertInto('goals')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: GoalChanges, trx: Database = db) =>
    trx
      .updateTable('goals')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
})
