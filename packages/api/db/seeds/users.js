exports.seed = async (knex) => {
  const adminPasswordHash =
    '$2a$13$Akt7Ne5JJQ.IrzYNLCTeTOFAGNWY22.nZE0aDB9IfKpLlpfE9J/Ua'
  await knex('users').truncate()
  await knex('users').insert([
    {
      email: 'superadmin@example.com',
      name: 'Teikei Superadmin',
      password: adminPasswordHash,
      origin: 'http://localhost:3000',
      baseurl: '/map#',
      phone: '',
      is_verified: true,
      verify_token: null,
      verify_short_token: null,
      verify_expires: null,
      verify_changes: null,
      reset_token: null,
      reset_short_token: null,
      reset_expires: null,
      created_at: '2013-10-31 18:09:57.000000',
      updated_at: '2017-09-27 14:09:43.992162'
    },
    {
      email: 'admin@example.com',
      name: 'Teikei Admin 1',
      password: adminPasswordHash,
      origin: 'http://localhost:3000',
      baseurl: '/map#',
      phone: null,
      is_verified: true,
      verify_token: null,
      verify_short_token: null,
      verify_expires: null,
      verify_changes: null,
      reset_token: null,
      reset_short_token: null,
      reset_expires: null,
      created_at: '2013-10-31 18:09:58.000000',
      updated_at: '2014-04-21 13:10:14.000000'
    },
    {
      email: 'admin2@example.com',
      name: 'Teikei Admin 2',
      password: adminPasswordHash,
      origin: 'http://localhost:4000',
      baseurl: '/map#',
      phone: null,
      is_verified: true,
      verify_token: null,
      verify_short_token: null,
      verify_expires: null,
      verify_changes: null,
      reset_token: null,
      reset_short_token: null,
      reset_expires: null,
      created_at: '2013-10-31 18:09:58.000000',
      updated_at: '2014-04-21 13:10:14.000000'
    },
    {
      email: 'user@example.com',
      name: 'Teikei User',
      password: adminPasswordHash,
      origin: 'http://localhost:3000',
      baseurl: '/map#',
      phone: null,
      is_verified: true,
      verify_token: null,
      verify_short_token: null,
      verify_expires: null,
      verify_changes: null,
      reset_token: null,
      reset_short_token: null,
      reset_expires: null,
      created_at: '2013-10-31 18:09:59.000000',
      updated_at: '2014-03-01 11:04:01.000000'
    }
  ])
}
