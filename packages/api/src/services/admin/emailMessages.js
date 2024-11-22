import createService from 'feathers-objection'
import { disallowIfCampaignsDisabled } from '../../hooks/email'
import EmailMessage from '../../models/emailMessages'

export default (app) => {
  const service = createService({
    model: EmailMessage,
    whitelist: ['$ilike'],
    paginate: {
      default: 50
    }
  })

  app.use('/admin/email-messages', service)
  app.service('/admin/email-messages').hooks({
    before: {
      create: [disallowIfCampaignsDisabled(app)],
      update: [disallowIfCampaignsDisabled(app)],
      patch: [disallowIfCampaignsDisabled(app)],
      remove: [disallowIfCampaignsDisabled(app)]
    }
  })
}
