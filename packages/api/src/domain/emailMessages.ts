import { notFound } from '../db/errors.ts'
import type { ListQuery } from '../db/feathersQuery.ts'
import type { Database } from '../db/kysely.ts'
import {
  createEmailMessagesRepository,
  type EmailMessageChanges,
  type EmailMessageValues
} from '../repositories/emailMessages.ts'
import { withoutServerFields } from './entryRules.ts'

export const createEmailMessagesDomain = (db: Database) => {
  const messages = createEmailMessagesRepository(db)

  const get = async (id: string) => {
    const row = await messages.findById(id)
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    list: (query: ListQuery) => messages.findPage(query),

    get,

    create: (input: EmailMessageValues) =>
      messages.insert(withoutServerFields(input)),

    patch: async (id: string, input: EmailMessageChanges) => {
      const changes = withoutServerFields(input)
      // react-admin sends {} for an unchanged form; answer with the record.
      if (Object.keys(changes).length === 0) {
        return get(id)
      }
      const row = await messages.update(id, changes)
      if (!row) {
        throw notFound(id)
      }
      return row
    },

    remove: async (id: string) => {
      const row = await messages.delete(id)
      if (!row) {
        throw notFound(id)
      }
      return row
    }
  }
}
