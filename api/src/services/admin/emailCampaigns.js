import createService from 'feathers-objection'

import { addFilteredTotal } from '../../hooks/admin'
import EmailCampaign from '../../models/emailCampaigns'
import { setCreatedAt, setUpdatedAt } from '../../hooks/audit'
import BaseModel from '../../models/base'
import { disallowIfCampaignsDisabled } from '../../hooks/email'

const getOneYearAgo = () =>
  new Date(new Date().setFullYear(new Date().getFullYear() - 1))

const getSegmentWhereClause = (segment) => {
  return (
    {
      ALL: 'where true',
      ONE_YEAR_INACTIVE: `where last_login < ${getOneYearAgo()}`,
    }[segment] || 'where false'
  )
}

const sendCampaign = async (campaignId, segment) => {
  const whereClause = getSegmentWhereClause(segment)
  console.log(
    `INSERT INTO email_messages (user_id, campaign_id) select id, ${campaignId} from users ${whereClause}`
  )
  await BaseModel.knex().raw(
    `INSERT INTO email_messages (user_id, campaign_id) select id, ${campaignId} from users ${whereClause}`
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
        disallowIfCampaignsDisabled(app),
        setCreatedAt,
        (ctx) => {
          ctx.params.status = 'CREATED'
          return ctx
        },
      ],
      find: [],
      get: [],
      update: [disallowIfCampaignsDisabled(app), setUpdatedAt],
      patch: [
        disallowIfCampaignsDisabled(app),
        setUpdatedAt,
        async (ctx) => {
          const previousCampaignData = await EmailCampaign.query().findById(
            ctx.id
          )
          if (
            previousCampaignData.status === 'CREATED' &&
            ctx.data.status === 'SENT'
          ) {
            await sendCampaign(ctx.id, ctx.data.segment)
          }
        },
      ],
      remove: [disallowIfCampaignsDisabled(app)],
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
