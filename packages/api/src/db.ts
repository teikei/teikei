import type { Application } from '@feathersjs/feathers'
import { createKysely } from './db/kysely.ts'

export default (app: Application) => {
  app.set('kysely', createKysely(app.get('postgres')))
}
