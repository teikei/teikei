exports.seed = async (knex) => {
  await knex.raw('TRUNCATE TABLE ?? RESTART IDENTITY CASCADE', ['roles'])
  await knex('roles').insert([
    {
      name: 'user'
    },
    {
      name: 'admin'
    },
    {
      name: 'superadmin'
    }
  ])
}
