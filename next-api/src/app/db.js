import knex from 'knex'
import { Model } from 'objection'

export default app => {
  const db = knex(app.get('postgres'))
  Model.knex(db)
}
