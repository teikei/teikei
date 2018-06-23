import knex from 'knex'
import { parse } from 'pg-connection-string'
import { Model } from 'objection'

export default app => {
  const connection = parse(app.get('postgres').url)
  const db = knex({ connection, client: 'pg' })
  Model.knex(db)
}
