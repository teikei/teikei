exports.seed = async knex => {
  await knex('roles').del()
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
