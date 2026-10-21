import { sql, type Transaction } from 'kysely'
import type { DB } from '../db/types.ts'

export type JoinTable =
  | 'farmsBadges'
  | 'farmsDepots'
  | 'farmsProducts'
  | 'farmsUsers'
  | 'depotsUsers'
  | 'initiativesBadges'
  | 'initiativesGoals'
  | 'initiativesUsers'

// Makes the join rows of one entry match `ids`: removes the others and adds
// the missing ones in the given order, which the relation loaders read back by
// join row id. An unknown id violates the foreign key, so the surrounding
// transaction fails with it.
export const replaceRelation = async (
  trx: Transaction<DB>,
  joinTable: JoinTable,
  ownerColumn: string,
  ownerId: string,
  relatedColumn: string,
  ids: readonly (string | number)[]
) => {
  const table = sql.table(joinTable)
  const owner = sql.ref(ownerColumn)
  const related = sql.ref(relatedColumn)
  const wanted = [...new Set(ids.map(String))]

  await sql`
    delete from ${table}
    where ${owner} = ${ownerId}
      and not (${related} = any(${wanted}::bigint[]))
  `.execute(trx)
  await sql`
    insert into ${table} (${owner}, ${related})
    select ${ownerId}, wanted.id
    from unnest(${wanted}::bigint[]) with ordinality as wanted(id, position)
    where not exists (
      select from ${table}
      where ${owner} = ${ownerId} and ${related} = wanted.id
    )
    order by wanted.position
  `.execute(trx)
}

// Relation loaders take the ids of every entry in a response, so each relation
// costs one query. An empty list would render `in ()`, which Postgres rejects.
export const forEntries = async <T>(
  ids: readonly string[],
  load: (ids: readonly string[]) => Promise<T[]>
): Promise<T[]> => (ids.length === 0 ? [] : load(ids))
