export default (app) => {
  app.jobs.schedule('send audit email', '0 16 * * FRI', async () => {
    app.info('CRON: sending audit email - starting')

    const mailerConfig = app.get('mailer')

    const recipients =
      mailerConfig.auditRecipients && mailerConfig.auditRecipients.split(',')
    app.info(`recipients: ${JSON.stringify(recipients)}`)
    if (recipients) {
      Promise.all(
        recipients.map(async (recipient) => {
          const report = await app.service('admin/audit').find()
          await app.service('emails').create({
            template: 'admin_audit',
            message: {
              to: recipient,
            },
            locals: {
              report,
            },
          })
        })
      )
    } else {
      app.info('CRON: no audit recipients specified, no audit email sent')
    }
    app.info('CRON: sending audit email - done')
  })
}
