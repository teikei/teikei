import { faker } from '@faker-js/faker'
import _ from 'lodash'

export const farmData = () => ({
  url: faker.internet.url(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  latitude: Number(faker.location.latitude()),
  longitude: Number(faker.location.longitude()),
  description: faker.lorem.sentence(),
  acceptsNewMembers: faker.helpers.arrayElement(['yes', 'no', 'waitlist']),
  foundedAtYear: faker.number.int({ min: 1970, max: 2018 }),
  foundedAtMonth: faker.number.int({ min: 1, max: 12 }),
  maximumMembers: faker.number.int({ min: 1, max: 200 }),
  additionalProductInformation: faker.lorem.sentence(),
  participation: faker.lorem.sentence(),
  actsEcological: faker.datatype.boolean(),
  products: [],
  badges: [],
  economicalBehavior: faker.lorem.sentence()
})

export const insertFarm = async (db) => {
  const row = await db
    .insertInto('farms')
    .values(_.omit(farmData(), ['products', 'badges']))
    .returningAll()
    .executeTakeFirstOrThrow()
  return { ...row, type: 'Farm' }
}
