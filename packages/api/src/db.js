import { createKysely } from './db/kysely.ts'

export default (app) => {
  app.set('kysely', createKysely(app.get('postgres')))
}
