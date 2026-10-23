import type { Application } from '@feathersjs/feathers'
import { createEntriesSearchRepository } from '../repositories/entriesSearch.ts'

export default (app: Application) => {
  const entriesSearch = createEntriesSearchRepository(app.get('kysely'))

  const service = {
    create: async (data: object) => {
      await entriesSearch.refresh()
      return data
    }
  }

  app.use('/searchindex', service)
}
