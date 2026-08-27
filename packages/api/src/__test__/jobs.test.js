import configureJobs from '../jobs/index.js'
import { logger } from '../logger.js'
import configureAdminJobs from '../services/admin/jobs.js'

const NEXT_NEW_YEAR = '0 0 1 1 *'

const setup = () => {
  let service
  const app = {
    configure: () => {},
    get: (key) =>
      key === 'features' ? { runJobsFromAdminUi: 'true' } : undefined,
    use: (path, registered) => {
      service = registered
    },
    service: () => ({ hooks: () => {} })
  }

  configureJobs(app)
  configureAdminJobs(app)

  return { app, service }
}

const cancelAll = (app) => {
  Object.values(app.jobs)
    .filter((entry) => entry && entry.job)
    .forEach((entry) => entry.job.cancel())
}

describe('scheduled job runs', () => {
  it('logs a failure and resolves so the scheduler keeps running', async () => {
    const error = new Error('Request failed with status code 500')
    const { app } = setup()
    const failing = vi.fn().mockRejectedValue(error)
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    app.jobs.schedule(8, 'import email bounces', NEXT_NEW_YEAR, failing)
    await expect(app.jobs[8].job.invoke()).resolves.toBeUndefined()

    expect(logger.error).toHaveBeenCalledWith(
      'CRON: import email bounces - failed',
      { error }
    )
    cancelAll(app)
  })
})

describe('manually triggered job runs', () => {
  it('reports the failure instead of the swallowed scheduled result', async () => {
    const { app, service } = setup()
    const failing = vi
      .fn()
      .mockRejectedValue(new Error('Request failed with status code 500'))

    app.jobs.schedule(8, 'import email bounces', NEXT_NEW_YEAR, failing)

    await expect(service.patch(8, { status: 'RUNNING' })).rejects.toThrow(
      'Request failed with status code 500'
    )
    cancelAll(app)
  })

  it('returns the job entry when the run succeeds', async () => {
    const { app, service } = setup()
    const succeeding = vi.fn().mockResolvedValue(undefined)

    app.jobs.schedule(8, 'import email bounces', NEXT_NEW_YEAR, succeeding)
    const result = await service.patch(8, { status: 'RUNNING' })

    expect(succeeding).toHaveBeenCalledTimes(1)
    expect(result).toBe(app.jobs[8])
    cancelAll(app)
  })

  it('refuses to run a job while the feature is disabled', async () => {
    const { app, service } = setup()
    app.get = () => ({ runJobsFromAdminUi: 'false' })
    const callback = vi.fn()

    app.jobs.schedule(8, 'import email bounces', NEXT_NEW_YEAR, callback)

    await expect(service.patch(8, { status: 'RUNNING' })).rejects.toThrow(
      'Feature is currently disabled.'
    )
    expect(callback).not.toHaveBeenCalled()
    cancelAll(app)
  })
})
