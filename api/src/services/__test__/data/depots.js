/* eslint-disable import/no-extraneous-dependencies */
import faker from 'faker'
import Depot from '../../../models/depots'

export const depotData = () => ({
  url: faker.internet.url(),
  name: faker.company.companyName(),
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  latitude: Number(faker.address.latitude()),
  longitude:  Number(faker.address.longitude()),
  description: faker.lorem.sentence(),
  deliveryDays: faker.lorem.sentence()
})

export const insertDepot = async () => {
  const depot = depotData()
  return Depot.query().insert(depot)
}
