import type { Application, Id, Params } from '@feathersjs/feathers'
import { mapDatabaseErrors } from '../../db/errors.ts'
import type { Database } from '../../db/kysely.ts'
import { createEmailMessagesDomain } from '../../domain/emailMessages.ts'
import { disallowIfCampaignsDisabled } from '../../hooks/email.js'
import type {
  EmailMessageChanges,
  EmailMessageValues
} from '../../repositories/emailMessages.ts'
import { toEmailMessage, toPage } from '../serializers.ts'

const createAdminEmailMessagesController = (db: Database) => {
  const messages = createEmailMessagesDomain(db)

  return {
    find: async (params: Params) =>
      toPage(await messages.list(params.query ?? {}), toEmailMessage),
    get: async (id: Id) => toEmailMessage(await messages.get(String(id))),
    create: async (data: EmailMessageValues) =>
      toEmailMessage(await messages.create(data)),
    patch: async (id: Id, data: EmailMessageChanges) =>
      toEmailMessage(await messages.patch(String(id), data)),
    remove: async (id: Id) => toEmailMessage(await messages.remove(String(id)))
  }
}

export default (app: Application) => {
  app.use(
    '/admin/email-messages',
    createAdminEmailMessagesController(app.get('kysely'))
  )
  app.service('admin/email-messages').hooks({
    before: {
      create: [disallowIfCampaignsDisabled(app)],
      patch: [disallowIfCampaignsDisabled(app)],
      remove: [disallowIfCampaignsDisabled(app)]
    },
    error: { all: [mapDatabaseErrors] }
  })
}
