const JOB_NAME = 'refresh search index'
const SCHEDULE_EVERY_5_MINUTES = '0/5 * * * *'

export default (app) => {
  app.jobs.schedule(JOB_NAME, SCHEDULE_EVERY_5_MINUTES, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)
    await app.service('searchindex').create({})
    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
