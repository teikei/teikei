import knex from 'knex'
import config from './knexfile'
import faker from 'faker'

const teikei = knex(config)

console.log('anonymizing user data.')

const anonymizeUsers = async () => {
  const users = await teikei('users')
  const promises = []
  users.forEach(async u => {
    if (u.email !== 'admin@teikei.com') {
      promises.push(
        teikei.schema.raw(`
       update users set
       name = '${faker.name
         .firstName()
         .replace("'", "''")} ${faker.name.lastName().replace("'", "''")}',
       email = '${faker.internet.email()}',
       phone ='${faker.phone.phoneNumber()}'
       where id = ${u.id}
      `)
      )
    }
  })
  await Promise.all(promises)
  console.log('done.')

  teikei.destroy()
}

anonymizeUsers()
