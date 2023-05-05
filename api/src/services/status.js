export default (app) => {
  const statusService = {
    async find() {
      return {
        status: 'RUNNING',
        emailCampaignsEnabled: app.get('mailer').emailCampaignsEnabled,
      }
    },
  }

  app.use('/status', statusService)
}
