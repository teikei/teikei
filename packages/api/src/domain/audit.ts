import moment from 'moment'
import type { Database } from '../db/kysely.ts'
import {
  createAuditRepository,
  type BadgeChangeRow
} from '../repositories/audit.ts'

const ENTITIES: Record<string, string> = {
  initiatives_badges: 'Initiative',
  farms_badges: 'Betrieb'
}

const CHANGES: Record<string, string> = { i: 'hinzugefügt', d: 'entfernt' }

// The lines of the weekly audit email.
const mapToText = (rows: BadgeChangeRow[]) =>
  rows
    .filter((r) => !(r.farmId == null && r.initiativeId == null))
    .map((d) => {
      const entity = ENTITIES[d.tableName]
      const change = CHANGES[d.action]
      const id = d.initiativeId || d.farmId
      const name = d.initiativeName || d.farmName
      const city = d.initiativeCity || d.farmCity

      return `${moment(d.time).format(
        'DD.MM.YYYY hh:mm'
      )} - ${change}: ${entity} ${id}, ${name}, ${city}`
    })

export const createAuditDomain = (db: Database) => {
  const audit = createAuditRepository(db)

  return {
    report: async () => mapToText(await audit.findBadgeChangesOfLastWeek())
  }
}
