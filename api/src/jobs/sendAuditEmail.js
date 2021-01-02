export default (app) => {
  app.jobs.schedule('send audit email', '0 16 * * FRI', async () => {
    app.info('CRON: sending audit email - starting')

    const recipients =
      app.get('audit_recipients') & app.get('audit_recipients').split(',')
    if (recipients) {
      recipients.forEach((recipient) => {
        app.service('admin/audit').find({
          query: { email: 'true', recipient },
        })
      })
    } else {
      app.info('CRON: no audit recipients specified, no audit email sent')
    }
    app.info('CRON: sending audit email - done')
  })
}
