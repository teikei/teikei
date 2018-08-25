exports.seed = async knex => {
  await knex('goals').del()
  await knex('goals').insert([
    {
      "id": 1,
      "name": "land"
    },
    {
      "id": 2,
      "name": "staff"
    },
    {
      "id": 3,
      "name": "organizers"
    },
    {
      "id": 4,
      "name": "consumers"
    }
  ])
}
