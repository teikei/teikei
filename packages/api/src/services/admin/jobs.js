import { Forbidden } from '@feathersjs/errors'
import { disallow } from 'feathers-hooks-common'
import { logger } from '../../logger'

export default (app) => {
  const service = {
    find: async () => {
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
            nextInvocation: job.nextInvocation()
          }))
      }
    },
    get: async (id) => {
      return app.jobs[id]
    },
    patch: async (id, params) => {
      if (app.get('features').runJobsFromAdminUi !== 'true') {
        throw new Forbidden('Feature is currently disabled.')
      }
      if (params.status === 'RUNNING') {
        const {
          job: { name, job }
        } = app.jobs[id]
        logger.info(`triggering job ${id} ${name}`)
        await job()
      }
      return app.jobs[id]
    }
  }

  app.use('/admin/jobs', service)
  app.service('/admin/jobs').hooks({
    before: {
      create: [disallow()],
      update: [disallow()],
      remove: [disallow()]
    }
  })
}
