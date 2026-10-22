// Query strings sent to admin/email-messages by the admin's ra-data-feathers
// calls, and the internal calls of the send job.
//
// admin/email-messages
//   find   $limit=10&$skip=0&$sort[<field>]=1 | -1
//            + List filters as <field>=<value>: id, campaignId, status
//          status=QUEUED                       sendEmailCampaignMessages
//   get    EmailMessagesEdit
//   create { userId, campaignId }              SendTestEmailButton
//   patch  changed fields only                 EmailMessagesEdit, send job
//   remove                                     DeleteButton
import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { EmailMessages } from '../db/types.ts'

export type EmailMessageRow = Selectable<EmailMessages>
export type EmailMessageValues = Insertable<EmailMessages>
export type EmailMessageChanges = Updateable<EmailMessages>

const QUERYABLE: (keyof EmailMessages)[] = [
  'id',
  'userId',
  'campaignId',
  'status',
  'sentAt',
  'sentTo'
]

export const createEmailMessagesRepository = (db: Database) => ({
  findPage: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('emailMessages').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('emailMessages')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  insert: (values: EmailMessageValues, trx: Database = db) =>
    trx
      .insertInto('emailMessages')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: EmailMessageChanges, trx: Database = db) =>
    trx
      .updateTable('emailMessages')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('emailMessages')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  queueForUsers: async (
    campaignId: string,
    userIds: readonly string[],
    trx: Database = db
  ) => {
    if (userIds.length > 0) {
      await trx
        .insertInto('emailMessages')
        .values(userIds.map((userId) => ({ userId, campaignId })))
        .execute()
    }
  }
})
