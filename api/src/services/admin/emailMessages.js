import createService from 'feathers-objection'

import { addFilteredTotal } from '../../hooks/admin'
import EmailMessage from '../../models/emailMessages'

export default (app) => {
  const service = createService({
    model: EmailMessage,
    whitelist: ['$ilike'],
    paginate: {
      default: 50,
    },
  })

  app.use('/admin/email-messages', service)
  app.service('/admin/email-messages').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
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
