import createService from 'feathers-objection'
import Role from '../../models/roles.js'

export default (app) => {
  const service = createService({
    model: Role,
    whitelist: ['$ilike'],
    paginate: {
      default: 50
    }
  })

  app.use('/admin/roles', service)
}
