import BaseModel from '../models/base'

const JOB_NAME = 'deactivate inactive users'
// const SCHEDULE_EVERY_QUARTER = '0 5 1 2,5,8,11 *'
const SCHEDULE_EVERY_QUARTER = '* * * * *'

export default (app) => {
  app.jobs.schedule(JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    const { rowCount } = await BaseModel.knex().raw(
      `update users
       set state = 'INACTIVE_NO_RESPONSE'
       where state = 'ACTIVE_REMINDER_SENT'
       and reminder_sent_at <= current_date - interval '2 months'`
    )
    app.info(`deactivated ${rowCount} users.`)

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
