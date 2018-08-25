exports.seed = async knex => {
  await knex('users_roles').del()
  await knex('users_roles').insert([
    {
      id: 1,
      role_id: 1,
      user_id: 1
    },
    {
      id: 2,
      role_id: 2,
      user_id: 1
    },
    {
      id: 3,
      role_id: 3,
      user_id: 1
    },
    {
      id: 4,
      role_id: 1,
      user_id: 2
    },
    {
      id: 5,
      role_id: 2,
      user_id: 2
    },
    {
      id: 6,
      role_id: 1,
      user_id: 3
    }
  ])
}
