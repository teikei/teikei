import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createEmailCampaignsDomain } from '../../domain/emailCampaigns.ts'
import { setUpdatedAt } from '../../hooks/audit.ts'
import { disallowIfCampaignsDisabled } from '../../hooks/email.ts'
import type { EmailCampaignChanges } from '../../repositories/emailCampaigns.ts'
import { fromRequest, toEmailCampaign, toPage } from '../serializers.ts'

const createAdminEmailCampaignsController = (db: Database) => {
  const campaigns = createEmailCampaignsDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await campaigns.list(params.query ?? {}), toEmailCampaign),
    get: async (id: Id) => toEmailCampaign(await campaigns.get(String(id))),
    patch: async (id: Id, data: EmailCampaignChanges) =>
      toEmailCampaign(await campaigns.patch(String(id), fromRequest(data))),
    remove: async (id: Id) =>
      toEmailCampaign(await campaigns.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use(
    '/admin/email-campaigns',
    createAdminEmailCampaignsController(app.get('kysely'))
  )
  app.service('admin/email-campaigns').hooks({
    before: {
      patch: [disallowIfCampaignsDisabled(app), setUpdatedAt],
      remove: [disallowIfCampaignsDisabled(app)]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
