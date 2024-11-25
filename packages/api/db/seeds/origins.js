exports.seed = async (knex) => {
  await knex('origins').truncate()
  await knex('origins').insert([
    {
      origin: 'http://localhost:3000',
      baseurl: '/#',
      origin_name: 'Teikei',
      organization_name: 'Teikei Example Organization',
      organization_email: 'superadmin@example.com'
    },
    {
      origin: 'http://localhost:4000',
      baseurl: '/#',
      origin_name: 'Teikei 2',
      organization_name: 'Teikei 2 Example Organization',
      organization_email: 'superadmin@example.com'
    }
  ])
}
