export default (app) => {
  app.jobs.schedule('send audit email', '0 16 * * 5', async () => {
    app.info('CRON: sending audit email - starting')

    const mailerConfig = app.get('mailer')

    const recipients =
      mailerConfig.auditRecipients && mailerConfig.auditRecipients.split(',')
    app.info(`recipients: ${JSON.stringify(recipients)}`)
    if (recipients) {
      await Promise.all(
        recipients.map(async (recipient) => {
          await app.service('admin/audit').find({
            query: { email: 'true', recipient },
          })
        })
      )
    } else {
      app.info('CRON: no audit recipients specified, no audit email sent')
    }
    app.info('CRON: sending audit email - done')
  })
}
