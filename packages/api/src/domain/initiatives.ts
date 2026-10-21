import type { Id, Query } from '@feathersjs/feathers'
import type { Insertable, Transaction, Updateable } from 'kysely'
import { notFound, validate, withFeathersErrors } from '../db/errors.ts'
import type { Database } from '../db/kysely.ts'
import type { DB, Initiatives } from '../db/types.ts'
import { schemas } from '../models/validation/index.js'
import {
  BADGE_COLUMNS,
  BADGE_SUMMARY,
  ENTRY_COLUMNS,
  INITIATIVE_COLUMNS
} from '../repositories/entries.ts'
import {
  createInitiativesRepository,
  type InitiativeRow
} from '../repositories/initiatives.ts'
import { replaceRelation } from '../repositories/relations.ts'
import { ADMIN_OWNER_COLUMNS, OWNER_COLUMNS } from '../repositories/users.ts'
import { toBadge } from './badges.ts'
import {
  adminFilters,
  byEntry,
  toId,
  toInitiative,
  toOwner,
  withoutServerFields,
  type AdminUser,
  type RelationIds
} from './entryRecords.ts'
import { toGoal } from './goals.ts'

type Relations = {
  goals?: RelationIds
  badges?: RelationIds
  ownerships?: RelationIds
}

type InitiativeInput = Insertable<Initiatives> & Relations

export type InitiativePatch = Updateable<Initiatives> & Relations

export const createInitiativesDomain = (db: Database) => {
  const initiatives = createInitiativesRepository(db)

  // Public details: goals and badges.
  const withPublicRelations = async (rows: InitiativeRow[]) => {
    const ids = rows.map(toId)
    const goals = byEntry(await initiatives.findGoals(ids), toGoal)
    const badges = byEntry(
      await initiatives.findBadges(ids, BADGE_SUMMARY),
      toBadge
    )
    return rows.map((row) => ({
      ...toInitiative(row),
      goals: goals(row.id),
      badges: badges(row.id)
    }))
  }

  // Admin reads: relation ids, or full records for the API partner's $details.
  const withAdminRelations = async (
    rows: InitiativeRow[],
    details: boolean
  ) => {
    const ids = rows.map(toId)
    const goals = byEntry(await initiatives.findGoals(ids), (goal) =>
      details ? toGoal(goal) : goal.id
    )
    const ownerships = details
      ? byEntry(await initiatives.findOwners(ids, ADMIN_OWNER_COLUMNS), toOwner)
      : byEntry(await initiatives.findOwners(ids, ['id']), toId)
    const badges = details
      ? byEntry(await initiatives.findBadges(ids, BADGE_COLUMNS), toBadge)
      : byEntry(await initiatives.findBadges(ids, ['id']), toId)
    return rows.map((row) => ({
      ...toInitiative(row),
      goals: goals(row.id),
      ownerships: ownerships(row.id),
      badges: badges(row.id)
    }))
  }

  // Replaces the relations present in the input and answers with their full
  // records, like the relate hooks did.
  const writeRelations = async (
    trx: Transaction<DB>,
    id: string,
    { goals, badges, ownerships }: Relations
  ) => {
    const ids = [id]
    const written: Record<string, unknown[]> = {}
    if (goals) {
      await replaceRelation(
        trx,
        'initiativesGoals',
        'initiativeId',
        id,
        'goalId',
        goals
      )
      written.goals = byEntry(await initiatives.findGoals(ids, trx), toGoal)(id)
    }
    if (badges) {
      await replaceRelation(
        trx,
        'initiativesBadges',
        'initiativeId',
        id,
        'badgeId',
        badges
      )
      written.badges = byEntry(
        await initiatives.findBadges(ids, BADGE_COLUMNS, trx),
        toBadge
      )(id)
    }
    if (ownerships) {
      await replaceRelation(
        trx,
        'initiativesUsers',
        'initiativeId',
        id,
        'userId',
        ownerships
      )
      written.ownerships = byEntry(
        await initiatives.findOwners(ids, ADMIN_OWNER_COLUMNS, trx),
        toOwner
      )(id)
    }
    return written
  }

  const create = (input: InitiativeInput, ownerId?: string) => {
    const { goals, badges, ownerships, ...columns } = withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await initiatives.insert(
          { ...columns, createdAt: new Date() },
          trx
        )
        const relations = await writeRelations(trx, row.id, {
          goals,
          badges,
          ownerships
        })
        if (ownerId) {
          await replaceRelation(
            trx,
            'initiativesUsers',
            'initiativeId',
            row.id,
            'userId',
            [ownerId]
          )
        }
        return { ...toInitiative(row), ...relations }
      })
    )
  }

  const patch = (id: Id, input: InitiativePatch) => {
    const { goals, badges, ownerships, ...columns } = withoutServerFields(input)
    return withFeathersErrors(
      db.transaction().execute(async (trx) => {
        const row = await initiatives.update(
          String(id),
          { ...columns, updatedAt: new Date() },
          trx
        )
        if (!row) {
          throw notFound(id)
        }
        const relations = await writeRelations(trx, row.id, {
          goals,
          badges,
          ownerships
        })
        return { ...toInitiative(row), ...relations }
      })
    )
  }

  const findById = async (id: Id, activeOnly: boolean) => {
    const row = await withFeathersErrors(
      initiatives.findById(String(id), { activeOnly })
    )
    if (!row) {
      throw notFound(id)
    }
    return row
  }

  return {
    list: async ({ $details, ...query }: Query) => {
      if ($details !== 'true') {
        const rows = await withFeathersErrors(
          initiatives.findActive(query, ENTRY_COLUMNS)
        )
        return rows.map(toInitiative)
      }
      const rows = await withFeathersErrors(
        initiatives.findActive(query, INITIATIVE_COLUMNS)
      )
      return withFeathersErrors(withPublicRelations(rows))
    },

    get: async (id: Id) => {
      const [initiative] = await withFeathersErrors(
        withPublicRelations([await findById(id, true)])
      )
      return initiative
    },

    create: (input: unknown, ownerId?: string) =>
      create(validate<InitiativeInput>(schemas.initiative, input), ownerId),

    patch: (id: Id, input: InitiativePatch) => patch(id, input),

    remove: async (id: Id) => {
      const row = await withFeathersErrors(initiatives.delete(String(id)))
      if (!row) {
        throw notFound(id)
      }
      return toInitiative(row)
    },

    listAdmin: async ({ $details, ...query }: Query, user?: AdminUser) => {
      const page = await withFeathersErrors(
        initiatives.findPage(query, adminFilters(user))
      )
      return {
        ...page,
        data: await withFeathersErrors(
          withAdminRelations(page.data, $details === 'true')
        )
      }
    },

    getAdmin: async (id: Id, details: boolean) => {
      const [initiative] = await withFeathersErrors(
        withAdminRelations([await findById(id, false)], details)
      )
      return initiative
    },

    createAdmin: (input: unknown) =>
      create(validate<InitiativeInput>(schemas.initiativeAdmin, input)),

    getForAuthorization: async (id: Id, activeOnly: boolean) => {
      const initiative = await withFeathersErrors(
        initiatives.findForAuthorization(String(id), { activeOnly })
      )
      if (!initiative) {
        throw notFound(id)
      }
      return initiative
    },

    // For entry contact messages: the active initiative and whom to send them
    // to.
    getWithOwners: async (id: Id) => {
      const row = await findById(id, true)
      const owners = await withFeathersErrors(
        initiatives.findOwners([row.id], OWNER_COLUMNS)
      )
      return {
        ...toInitiative(row),
        ownerships: byEntry(owners, toOwner)(row.id)
      }
    },

    isInAdminOrigins: (id: Id, userId: Id) =>
      withFeathersErrors(
        initiatives.isInAdminOrigins(String(id), String(userId))
      )
  }
}
