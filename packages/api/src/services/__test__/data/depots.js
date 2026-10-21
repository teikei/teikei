import { faker } from '@faker-js/faker'

export const depotData = () => ({
  url: faker.internet.url(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  latitude: Number(faker.location.latitude()),
  longitude: Number(faker.location.longitude()),
  description: faker.lorem.sentence(),
  deliveryDays: faker.lorem.sentence()
})

export const insertDepot = async (db) => {
  const row = await db
    .insertInto('depots')
    .values(depotData())
    .returningAll()
    .executeTakeFirstOrThrow()
  return { ...row, type: 'Depot' }
}
