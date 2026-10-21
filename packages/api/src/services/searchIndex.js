import { createEntriesSearchRepository } from '../repositories/entriesSearch.ts'

export default (app) => {
  const entriesSearch = createEntriesSearchRepository(app.get('kysely'))

  const service = {
    create: async (data) => {
      await entriesSearch.refresh()
      return data
    }
  }

  app.use('/searchindex', service)
}
