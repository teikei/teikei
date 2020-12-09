import schedule from 'node-schedule'

export default (app) => {
  const job = schedule.scheduleJob('0/5 * * * *', async () => {
    app.logger.info('CRON: refreshing search index - starting')
    await app.service('searchindex').create({})
    app.logger.info('CRON: refreshing search index - done')
  })
  app.jobs.register(job)
}
