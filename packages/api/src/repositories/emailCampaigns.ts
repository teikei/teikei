// Query strings sent to admin/email-campaigns by the admin's ra-data-feathers
// calls, and the internal calls of the send job. The reminder jobs create the
// campaigns through the campaign domain.
//
// admin/email-campaigns
//   find   $limit=25&$skip=0&$sort[<field>]=1 | -1   EmailCampaignsList
//          id[$in][]=<id>...&$limit=<n>             getMany (messages list)
//   get    EmailCampaignsEdit, the send job
//   patch  changed fields only                       EmailCampaignsEdit
//   remove                                           DeleteButton
import type { Query } from '@feathersjs/feathers'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { findPage } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import type { EmailCampaigns } from '../db/types.ts'

export type EmailCampaignRow = Selectable<EmailCampaigns>
export type EmailCampaignValues = Insertable<EmailCampaigns>
export type EmailCampaignChanges = Updateable<EmailCampaigns>

const QUERYABLE: (keyof EmailCampaigns)[] = [
  'id',
  'name',
  'template',
  'status',
  'createdAt',
  'updatedAt'
]

export const createEmailCampaignsRepository = (db: Database) => ({
  findPage: (query: Query, trx: Database = db) =>
    findPage(trx.selectFrom('emailCampaigns').selectAll(), query, QUERYABLE),

  findById: (id: string, trx: Database = db) =>
    trx
      .selectFrom('emailCampaigns')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  insert: (values: EmailCampaignValues, trx: Database = db) =>
    trx
      .insertInto('emailCampaigns')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow(),

  update: (id: string, values: EmailCampaignChanges, trx: Database = db) =>
    trx
      .updateTable('emailCampaigns')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: (id: string, trx: Database = db) =>
    trx
      .deleteFrom('emailCampaigns')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
})
