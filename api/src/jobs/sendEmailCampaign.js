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
        const user = await app.service('users').get(message.userId)
        await app.service('emails').create({
          template: 'user_broadcast',
          message: {
            to: user.email,
          },
          locals: {
            message: {
              title: 'This is a broadcast',
              message: 'Please evacuate the area',
            },
          },
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
