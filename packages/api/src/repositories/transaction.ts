import type { Database } from '../db/kysely.ts'

// Lets a domain make several repository calls atomic without handling Kysely
// itself: every repository method accepts the handle as its last argument.
export const transaction = <T>(
  db: Database,
  fn: (tx: Database) => Promise<T>
): Promise<T> => db.transaction().execute(fn)
