const JOB_NAME = 'deactivate inactive users'
const SCHEDULE_EVERY_QUARTER = '0 0 1 2,5,8,11 *'

export default (app) => {
  app.jobs.schedule(JOB_NAME, SCHEDULE_EVERY_QUARTER, async () => {
    app.info(`CRON: ${JOB_NAME} - starting`)

    const remindedUsersWithoutResponse = await app.service('users', {
      query: { state: 'ACTIVE_REMINDER_SENT' },
    })
    const userCount = remindedUsersWithoutResponse.data.length
    app.info(`found ${userCount} users in state ACTIVE_REMINDER_SENT`)

    // await Promise.all(users.data.map(async (u) => {
    //   app.info(`deactivating user with id ${u.id}`)
    //   app.service('users').patch({id: u.id, state: 'INACTIVE_NO_RESPONSE'})
    // })

    app.info(`CRON: ${JOB_NAME} - done`)
  })
}
