exports.seed = async (knex) => {
  await knex('farms_users').truncate()
  await knex('farms_users').insert([
    {
      farm_id: 1,
      user_id: 1,
    },
  ])
  await knex('depots_users').truncate()
  await knex('depots_users').insert([
    {
      depot_id: 1,
      user_id: 1,
    },
  ])
  await knex('initiatives_users').truncate()
  await knex('initiatives_users').insert([
    {
      initiative_id: 1,
      user_id: 1,
    },
  ])
}
