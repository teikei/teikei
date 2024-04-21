exports.seed = async (knex) => {
  await knex('goals').truncate()
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
