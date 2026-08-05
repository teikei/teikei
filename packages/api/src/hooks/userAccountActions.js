import BaseModel from '../models/base'

export const updateUserEntriesActiveState = async (app, id, active) => {
  const activeState = active ? 'true' : 'false'

  await BaseModel.knex().raw(`
    update farms f set active = ${activeState} where f.id IN
    (select fa.farm_id from farms_users fa, users u
    where u.id = fa.user_id
    and u.id = ${id})
  `)

  await BaseModel.knex().raw(`
    update initiatives i set active = ${activeState} where i.id IN
    (select ia.initiative_id from initiatives_users ia, users u
    where u.id = ia.user_id
     and u.id = ${id})
  `)

  await BaseModel.knex().raw(`
    update depots d set active = ${activeState} where d.id IN
    (select fd.depot_id from farms_users fa, users u, farms_depots fd
    where u.id = fa.user_id
    and fd.farm_id = fa.farm_id
     and u.id = ${id})
  `)
}

export const updateUserState = async (app, id, active) => {
  await app.service('users').patch(id, {
    active
  })
}

export const resetUserLoginActivityState = async (app, id) => {
  await app.service('users').patch(id, {
    state: 'RECENT_LOGIN',
    last_login: new Date().toISOString(),
    reminder_sent_at: null,
    second_reminder_sent_at: null,
    reactivationToken: null
  })
}
