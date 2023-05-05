import createService from 'feathers-objection'

import { addFilteredTotal } from '../../hooks/admin'
import EmailCampaign from '../../models/emailCampaigns'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import BaseModel from '../../models/base'

const sendCampaign = async (campaignId) => {
  await BaseModel.knex().raw(
    `INSERT INTO email_messages (user_id, campaign_id) select id, ${campaignId} from users`
  )
}

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
        setCreatedAt,
        (ctx) => {
          ctx.params.status = 'CREATED'
          return ctx
        },
      ],
      find: [],
      get: [],
      update: [setUpdatedAt],
      patch: [
        setUpdatedAt,
        async (ctx) => {
          const previousCampaignData = await EmailCampaign.query().findById(
            ctx.id
          )
          if (
            previousCampaignData.status === 'CREATED' &&
            ctx.data.status === 'SENT'
          ) {
            await sendCampaign(ctx.id)
          }
        },
      ],
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
