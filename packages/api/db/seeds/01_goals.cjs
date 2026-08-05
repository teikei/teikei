exports.seed = async (knex) => {
  await knex.raw('TRUNCATE TABLE ?? RESTART IDENTITY CASCADE', ['goals'])
  await knex('goals').insert([
    {
      name: 'land'
    },
    {
      name: 'staff'
    },
    {
      name: 'organizers'
    },
    {
      name: 'consumers'
    }
  ])
}
