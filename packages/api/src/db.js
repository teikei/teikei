import { knex } from 'knex'
import Client from 'knex/lib/dialects/postgres'
import { Model, knexSnakeCaseMappers } from 'objection'

export default (app) => {
  const db = knex({
    client: Client,
    connection: app.get('postgres').connection,
    ...knexSnakeCaseMappers()
  })
  Model.knex(db)
}
