/* eslint-disable import/no-extraneous-dependencies */
import faker from 'faker'
import Farm from '../../../models/farms'

export const farmData = () => ({
  url: faker.internet.url(),
  name: faker.company.companyName(),
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  latitude: Number(faker.address.latitude()),
  longitude: Number(faker.address.longitude()),
  description: faker.lorem.sentence(),
  acceptsNewMembers: faker.random.arrayElement(['yes', 'no', 'waitlist']),
  foundedAtYear: faker.datatype.number({ min: 1970, max: 2018 }),
  foundedAtMonth: faker.datatype.number({ min: 1, max: 12 }),
  maximumMembers: faker.datatype.number({ min: 1, max: 200 }),
  additionalProductInformation: faker.lorem.sentence(),
  participation: faker.lorem.sentence(),
  actsEcological: faker.datatype.boolean(),
  products: [],
  badges: [],
  economicalBehavior: faker.lorem.sentence(),
})

export const insertFarm = async () => {
  const farm = farmData()
  return Farm.query().insert(farm)
}
