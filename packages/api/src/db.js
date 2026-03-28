import { knex } from 'knex'
import { Model, knexSnakeCaseMappers } from 'objection'

export default (app) => {
  const db = knex({
    client: 'postgres',
    connection: app.get('postgres').connection,
    ...knexSnakeCaseMappers()
  })
  Model.knex(db)
}
