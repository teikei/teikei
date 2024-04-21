/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker'
import Depot from '../../../models/depots'

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

export const insertDepot = async () => {
  const depot = depotData()
  return Depot.query().insert(depot)
}
