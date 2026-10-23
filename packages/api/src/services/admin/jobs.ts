import { Forbidden } from '@feathersjs/errors'
import type { Application, Id } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'
import { logger } from '../../logger.ts'

export default (app: Application) => {
  // REST ids arrive as strings, which index the array like numbers.
  const jobAt = (id: Id) => app.jobs[id as number]

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
    get: async (id: Id) => {
      return jobAt(id)
    },
    patch: async (id: Id, params: { status?: string }) => {
      if (app.get('features').runJobsFromAdminUi !== 'true') {
        throw new Forbidden('Feature is currently disabled.')
      }
      if (params.status === 'RUNNING') {
        const { job, run } = jobAt(id)
        logger.info(`triggering job ${id} ${job.name}`)
        await run()
      }
      return jobAt(id)
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
