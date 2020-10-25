import Queue from 'bull'
import Role from '../models/roles'

export const SEND_AUDIT_EMAIL = {
  queueName: 'send_audit_email',
  jobName: 'Send audit email',
}

export default (app) => {
  const queue = new Queue(SEND_AUDIT_EMAIL.queueName, {
    redis: app.get('redis').url,
  })

  queue.process(async (job) => {
    job.log('sending audit email')
    const adminRole = await Role.query()
      .withGraphFetched('users')
      .where({ name: 'admin' })
    const admins = adminRole[0].users

    admins.forEach((admin) => {
      app.service('admin/audit').find({
        query: { email: 'true', recipient: admin.email },
      })
    })

    job.progress(100)
  })

  queue.add({ name: SEND_AUDIT_EMAIL.jobName })
  queue.add(
    { name: SEND_AUDIT_EMAIL.jobName },
    { repeat: { cron: '0 16 * * FRI' } }
  )
}
