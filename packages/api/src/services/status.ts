import type { Application } from '@feathersjs/feathers'

export default (app: Application) => {
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
