import Queue from 'bull'

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
    await app.service('admin/audit').find({
      query: { email: 'true', recipient: app.get('mailer').message.from },
    })
    job.progress(100)
  })

  queue.add({ name: SEND_AUDIT_EMAIL.jobName })
  queue.add(
    { name: SEND_AUDIT_EMAIL.jobName },
    { repeat: { cron: '0 16 * * FRI' } }
  )
}
