import knex from 'knex'
import Client from 'knex/lib/dialects/postgres'
import { parse } from 'pg-connection-string'
import { Model, knexSnakeCaseMappers } from 'objection'

export default app => {
  const connection = parse(app.get('postgres').url)

  const db = knex({
    client: Client,
    connection,
    ...knexSnakeCaseMappers()
  });
  Model.knex(db)
}
