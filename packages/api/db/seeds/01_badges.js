export const seed = async (knex) => {
  await knex.raw('TRUNCATE TABLE ?? RESTART IDENTITY CASCADE', ['badges'])
  await knex('badges').insert([
    {
      name: 'Agriculture Association',
      category: 'associations',
      country: 'DEU',
      url: 'http://www.agriculture.com',
      logo: '/agriculture.png'
    },
    {
      name: 'Organic Foo Certification',
      category: 'certifications',
      country: 'DEU',
      url: 'http://www.organic.com',
      logo: '/organic.png'
    }
  ])
}
