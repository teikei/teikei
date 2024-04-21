import moment from 'moment'
import Audit from '../../models/audit'

const mapToText = (rows) => {
  return rows
    .filter((r) => !(r.farm_id == null && r.initiative_id == null))
    .map((d) => {
      const entity = {
        initiatives_badges: 'Initiative',
        farms_badges: 'Betrieb'
      }[d.table_name]
      const change = { i: 'hinzugefügt', d: 'entfernt' }[d.action]
      const id = d.initiative_id || d.farm_id
      const name = d.initiative_name || d.farm_name
      const city = d.initiative_city || d.farm_city

      return `${moment(d.time).format(
        'DD.MM.YYYY hh:mm'
      )} - ${change}: ${entity} ${id}, ${name}, ${city}`
    })
}

export default (app) => {
  const service = {
    find: async () => {
      const auditTrail = await Audit.knex().raw(
        `
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
`
      )
      return mapToText(auditTrail.rows)
    }
  }

  app.use('/admin/audit', service)
}
