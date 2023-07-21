const JOB_NAME = 'create login reminders'
const SCHEDULE_EVERY_QUARTER = '0 0 1 3,6,9,12 *'

export default (app) => {
  app.jobs.schedule(JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    app.info(`creating email campaign`)
    const emailCampaign = await app.service('admin/emailCampaigns').create({
      name: `Login Reminders ${Date.now()}`,
      template: 'login_reminder',
      segment: 'ONE_YEAR_INACTIVE',
    })
    app.info(`email campaign with id ${emailCampaign} created`)
    app.info(`sending email campaign with id ${emailCampaign}`)
    await app.service('admin/emailCampaigns').patch({
      id: emailCampaign.id,
      status: 'SENT',
    })

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
