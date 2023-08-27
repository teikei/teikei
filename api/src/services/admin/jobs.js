import { disallow } from 'feathers-hooks-common'
import { Forbidden } from '@feathersjs/errors'

export default (app) => {
  const service = {
    find: async (params) => {
      return {
        total: app.jobs.length,
        limit: app.jobs.length,
        skip: 0,
        data: app.jobs
          .filter((jobEntry) => jobEntry !== null)
          .map(({ id, cron, job }) => ({
            id,
            name: job.name,
            cron,
            nextInvocation: job.nextInvocation(),
          })),
      }
    },
    get: async (id, params) => {
      return app.jobs[id]
    },
    patch: async (id, params) => {
      if (app.get('features').runJobsFromAdminUi !== 'true') {
        throw new Forbidden('Feature is currently disabled.')
      }
      if (params.status === 'RUNNING') {
        const { name, callback } = app.jobs[id]
        app.info(`triggering job ${id} ${name}`)
        await callback()
      }
      return app.jobs[id]
    },
  }

  app.use('/admin/jobs', service)
  app.service('/admin/jobs').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [disallow()],
      update: [disallow()],
      patch: [],
      remove: [disallow()],
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
