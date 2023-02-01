import createService from 'feathers-objection'

import { addFilteredTotal } from '../../hooks/admin'
import EmailCampaign from '../../models/emailCampaigns'

export default (app) => {
  const service = createService({
    model: EmailCampaign,
    whitelist: ['$ilike'],
    paginate: {
      default: 50,
    },
  })

  app.use('/admin/email-campaigns', service)
  app.service('/admin/email-campaigns').hooks({
    before: {
      all: [],
      create: [
        (ctx) => {
          ctx.params.status = 'CREATED'
          return ctx
        },
      ],
      find: [],
      get: [],
      patch: [],
      remove: [],
      update: [],
    },
    after: {
      all: [],
      find: [addFilteredTotal],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  })
}
