export default (app) => {
  app.jobs.schedule('send email campaign messages', '* * * * *', async () => {
    app.info('CRON: sending queued campaign messages')

    const queuedMessages = await app
      .service('admin/email-messages')
      .find({ query: { status: 'QUEUED' } })

    if (queuedMessages.data.length === 0) {
      app.info(`there are no queued messages`)
      return
    }

    app.info(`found ${queuedMessages.data.length} queued messages`)

    await Promise.all(
      queuedMessages.data.map(async (message) => {
        const campaign = await app
          .service('admin/email-campaigns')
          .find(message.campaignId)
        if (campaign.total !== 1) {
          app.error(
            `failed to retrieve campaign for message ${message.id}, cannot send message`
          )
          return
        }
        app.info(
          `sending email for message ${message.id} of campaign ${campaign.data[0].id}`
        )
        const user = await app.service('users').get(message.userId)
        await app.service('emails').create({
          template: campaign.data[0].template,
          message: {
            messageStream: 'broadcast',
            to: user.email,
          },
          locals: {},
        })
        await app.service('admin/email-messages').patch(message.id, {
          status: 'SENT',
          sentAt: new Date().toISOString(),
          sentTo: user.email,
        })
      })
    )

    app.info('CRON: sending queued campaign messages - done')
  })
}
