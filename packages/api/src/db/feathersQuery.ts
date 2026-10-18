// Translates the Feathers query syntax the admin's data provider sends into
// Kysely, for an allowlist of columns per resource.
//
// What ra-data-feathers emits for the lookup resources (admin/products, goals,
// badges, roles, origins):
//
//   getList (List pages, ReferenceArrayInput choices, useGetList)
//     $limit=<perPage>&$skip=<perPage * (page - 1)>
//     $sort[<field>]=1 | -1
//     <field>=<value>          List filters (none of the lookup lists has one)
//     origin[$ne]=default      admin/origins choices in the user form
//   getMany (ReferenceArrayInput values)
//     id[$in][]=<id>...&$limit=<number of ids>
//   getManyReference           not used for the lookups
//
// $ilike is not sent by the admin today but stays supported, as the
// feathers-objection services whitelisted it. Everything else is rejected with
// BadRequest instead of being silently ignored.
import { filterQuery } from '@feathersjs/adapter-commons'
import { BadRequest } from '@feathersjs/errors'
import type { Paginated, Query } from '@feathersjs/feathers'
import { sql, type SelectQueryBuilder } from 'kysely'

const FILTERS = ['$limit', '$skip', '$sort']

const OPERATORS: Record<string, 'in' | '<>' | 'ilike'> = {
  $in: 'in',
  $ne: '<>',
  $ilike: 'ilike'
}

// Matches feathers-objection with `paginate: { default: 50 }` and no max.
const PAGINATE = { default: 50 }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value?.constructor === Object

const assertColumn = (column: string, columns: readonly string[]) => {
  if (!columns.includes(column)) {
    throw new BadRequest(`Invalid query parameter ${column}`)
  }
}

export const findPage = async <DB, TB extends keyof DB, O>(
  select: SelectQueryBuilder<DB, TB, O>,
  query: Query,
  columns: readonly string[]
): Promise<Paginated<O>> => {
  for (const key of Object.keys(query)) {
    if (key.startsWith('$') && !FILTERS.includes(key)) {
      throw new BadRequest(`Invalid query parameter ${key}`)
    }
  }
  const { filters, query: where } = filterQuery(query, {
    paginate: PAGINATE,
    operators: ['$ilike']
  })

  let filtered = select
  for (const [column, condition] of Object.entries(where)) {
    assertColumn(column, columns)
    const conditions = isPlainObject(condition)
      ? Object.entries(condition)
      : [['=', condition]]
    for (const [operator, value] of conditions) {
      const sqlOperator = operator === '=' ? '=' : OPERATORS[operator]
      if (!sqlOperator) {
        throw new BadRequest(`Invalid query operator ${operator}`)
      }
      const values = sqlOperator === 'in' ? [value].flat() : undefined
      filtered =
        values?.length === 0
          ? filtered.where(sql<boolean>`false`)
          : filtered.where(sql.ref(column), sqlOperator, values ?? value)
    }
  }

  const sort: Record<string, number> = filters.$sort ?? {}
  let sorted = filtered
  for (const [column, direction] of Object.entries(sort)) {
    assertColumn(column, columns)
    sorted = sorted.orderBy(sql.ref(column), direction === -1 ? 'desc' : 'asc')
  }

  const limit: number = filters.$limit
  const skip: number = filters.$skip ?? 0
  const [{ total }, data] = await Promise.all([
    filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<string>().as('total'))
      // clearSelect() loses the row type when the table is generic
      .$castTo<{ total: string }>()
      .executeTakeFirstOrThrow(),
    sorted.limit(limit).offset(skip).execute()
  ])

  return { total: Number(total), limit, skip, data }
}
