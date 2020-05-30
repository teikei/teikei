exports.seed = async (knex) => {
  await knex('roles').truncate()
  await knex('roles').insert([
    {
      name: 'user',
    },
    {
      name: 'admin',
    },
    {
      name: 'superadmin',
    },
  ])
}
