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
  foundedAtYear: faker.random.number({ max: 2018 }),
  foundedAtMonth: faker.random.number({ max: 12 }),
  maximumMembers: faker.random.number({ max: 200 }),
  additionalProductInformation: faker.lorem.sentence(),
  participation: faker.lorem.sentence(),
  actsEcological: faker.lorem.boolean(),
  economicalBehavior: faker.lorem.sentence()
})

export const insertFarm = async () => {
  const farm = farmData()
  return Farm.query().insert(farm)
}
