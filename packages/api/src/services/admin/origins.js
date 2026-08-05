import createService from 'feathers-objection'
import Origin from '../../models/origins.js'

export default (app) => {
  const service = createService({
    model: Origin,
    whitelist: ['$ilike'],
    paginate: {
      default: 50
    }
  })

  app.use('/admin/origins', service)
}
