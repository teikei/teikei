import { disallow } from 'feathers-hooks-common'
import Queue from 'bull'

import filterAllowedFields from '../hooks/filterAllowedFields'
import BaseModel from '../models/base'

export default app => {
  const DEFAULT_JOB_NAME = 'Refresh Search Index'

  const queue = new Queue('refresh_search_index', app.get('redis').url)

  queue.process(async job => {
    app.info('refreshing search index')
    await BaseModel.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY entries_search')
    job.progress(100)
  })

  const service = {
    create: (data, params) =>
      queue.add({ ...data, name: data.name || DEFAULT_JOB_NAME }, params)
  }

  app.use('/jobs/refreshSearchIndex', service)

  app
    .service('jobs/refreshSearchIndex')
    .hooks({
      before: {
        all: [disallow('external')],
        create: []
      },
      after: {
        all: [],
        create: []
      },
      error: {
        all: [],
        create: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })

  // TODO refreshing every 5 minutes. maybe refresh immediately on change?
  app.service('jobs/refreshSearchIndex').create({})
  app
    .service('jobs/refreshSearchIndex')
    .create({}, { repeat: { cron: '0/5 * * * *' } })
}
