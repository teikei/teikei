import { sql } from 'kysely'
import type { Database } from '../db/kysely.ts'

// The badge changes of farms and initiatives, newest first.
export type BadgeChangeRow = {
  time: Date
  action: 'i' | 'd' | 'u'
  tableName: string
  farmId: string | null
  farmName: string | null
  farmCity: string | null
  initiativeId: string | null
  initiativeName: string | null
  initiativeCity: string | null
}

export const createAuditRepository = (db: Database) => ({
  findBadgeChangesOfLastWeek: async (trx: Database = db) =>
    (
      await sql<BadgeChangeRow>`
with audit_table as
(select
action_timestamp as time,
svals(slice(old_values, ARRAY['farm_id']))::INT as old_farm_id,
svals(slice(old_values, ARRAY['initiative_id']))::INT as old_initiative_id,
svals(slice(old_values, ARRAY['badge_id']))::INT as old_badge_id,
svals(slice(new_values, ARRAY['farm_id']))::INT as new_farm_id,
svals(slice(new_values, ARRAY['initiative_id']))::INT as new_initiative_id,
svals(slice(new_values, ARRAY['badge_id']))::INT as new_badge_id,
table_name,
action
from audit
where action_timestamp >= (current_timestamp at time zone 'utc' - interval '7 days')
)
select
time, action, f.id as farm_id, f.name as farm_name,  f.city as farm_city, i.id as initiative_id,  i.name as initiative_name, i.city as initiative_city, a.*
from audit_table a
left outer join farms f on f.id =  (case when a.old_farm_id is not null then a.old_farm_id else a.new_farm_id end )
left outer join initiatives i on i.id = (case when a.old_initiative_id is not null then a.old_initiative_id else a.new_initiative_id end )
order by a.time desc
`.execute(trx)
    ).rows
})
