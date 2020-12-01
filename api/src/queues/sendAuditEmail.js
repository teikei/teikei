import schedule from 'node-schedule'
import Role from '../models/roles'

export default (app) => {
  schedule.scheduleJob('0 16 * * FRI', async () => {
    app.logger.info('CRON: sending audit email - starting')
    const adminRole = await Role.query()
      .withGraphFetched('users')
      .where({ name: 'admin' })
    const admins = adminRole[0].users

    admins.forEach((admin) => {
      app.service('admin/audit').find({
        query: { email: 'true', recipient: admin.email },
      })
    })
    app.logger.info('CRON: sending audit email - done')
  })
}
