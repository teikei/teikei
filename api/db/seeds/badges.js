exports.seed = async (knex) => {
  await knex('badges').truncate()
  await knex('badges').insert([
    {
      name: 'Agriculture Association',
      category: 'ASSOCIATION',
      url: 'http://www.agriculture.com',
      logo: '/agriculture.png',
    },
    {
      name: 'Organic Foo Certification',
      category: 'CERTIFICATE',
      url: 'http://www.organic.com',
      logo: '/organic.png',
    },
  ])
}
