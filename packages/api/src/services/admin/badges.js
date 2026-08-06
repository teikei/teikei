import createService from 'feathers-objection'
import Badge from '../../models/badges.js'

export default (app) => {
  const service = createService({
    model: Badge,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50
    }
  })

  app.use('/admin/badges', service)
}
