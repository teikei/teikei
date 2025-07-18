import createService from 'feathers-objection'

import Goal from '../../models/goals'

export default (app) => {
  const service = createService({
    model: Goal,
    whitelist: ['$eager', '$ilike'],
    paginate: {
      default: 50
    }
  })

  app.use('/admin/goals', service)
}
