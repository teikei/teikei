export default (app) => {
  const statusService = {
    async find() {
      return {
        status: 'RUNNING',
        features: app.get('features')
      }
    }
  }

  app.use('/status', statusService)
}
