exports.seed = async (knex) => {
  await knex('users_roles').truncate()
  await knex('users_roles').insert([
    {
      role_id: 1,
      user_id: 1
    },
    {
      role_id: 2,
      user_id: 1
    },
    {
      role_id: 3,
      user_id: 1
    },
    {
      role_id: 1,
      user_id: 2
    },
    {
      role_id: 2,
      user_id: 2
    },
    {
      role_id: 1,
      user_id: 3
    },
    {
      role_id: 2,
      user_id: 3
    },
    {
      role_id: 1,
      user_id: 4
    }
  ])
}
