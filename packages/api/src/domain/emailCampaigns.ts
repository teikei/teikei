import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createEmailCampaignsRepository,
  type EmailCampaignChanges
} from '../repositories/emailCampaigns.ts'
import { createEmailMessagesRepository } from '../repositories/emailMessages.ts'
import { transaction } from '../repositories/transaction.ts'
import { createUsersRepository } from '../repositories/users.ts'

const prettyTimestamp = (date: Date) =>
  `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE')}`

export const createEmailCampaignsDomain = (db: Database) => {
  const campaigns = createEmailCampaignsRepository(db)
  const messages = createEmailMessagesRepository(db)
  const users = createUsersRepository(db)

  // A sent campaign, created with the reminder states of its recipients and
  // their queued messages, so a failure leaves no empty campaign behind.
  const startReminders = (
    name: string,
    template: string,
    markRecipients: (sentAt: Date, tx: Database) => Promise<string[]>
  ) =>
    transaction(db, async (tx) => {
      const now = new Date()
      const campaign = await campaigns.insert(
        {
          name: `${name} ${prettyTimestamp(now)}`,
          template,
          status: 'SENT',
          createdAt: now
        },
        tx
      )
      const userIds = await markRecipients(now, tx)
      await messages.queueForUsers(campaign.id, userIds, tx)
      return { campaignId: campaign.id, messageCount: userIds.length }
    })

  return {
    list: (query: ListQuery) => campaigns.findPage(query),

    get: async (id: string) => {
      const row = await campaigns.findById(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    patch: async (id: string, input: EmailCampaignChanges) => {
      const row = await campaigns.update(id, input)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    startLoginReminders: () =>
      startReminders(
        'Login Reminders',
        'login_reminder',
        users.markReminderSent
      ),

    startSecondLoginReminders: () =>
      startReminders(
        'Second Login Reminders',
        'second_login_reminder',
        users.markSecondReminderSent
      ),

    remove: async (id: string) => {
      const row = await campaigns.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
