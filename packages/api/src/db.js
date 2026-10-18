import knex from 'knex'
import Client from 'knex/lib/dialects/postgres/index.js'
import { Model, knexSnakeCaseMappers } from 'objection'
import { createKysely } from './db/kysely.ts'

export default (app) => {
  const db = knex({
    client: Client,
    connection: app.get('postgres').connection,
    ...knexSnakeCaseMappers()
  })
  Model.knex(db)

  app.set('kysely', createKysely(app.get('postgres')))
}
