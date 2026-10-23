import type { Application, Id } from '@feathersjs/feathers'
import { withFeathersErrors } from '../db/errors.ts'
import { createUsersDomain } from '../domain/users.ts'

// The authentication after-hook calls these outside the users service's hook
// chain, so they map database errors themselves.
const usersDomain = (app: Application) => createUsersDomain(app.get('kysely'))

// Sets the active flag of the user and of their entries.
export const setAccountActive = (app: Application, id: Id, active: boolean) =>
  withFeathersErrors(usersDomain(app).setActive(String(id), active))

export const recordLogin = (app: Application, id: Id) =>
  withFeathersErrors(usersDomain(app).recordLogin(String(id)))
