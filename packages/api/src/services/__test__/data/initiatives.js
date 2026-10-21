import { faker } from '@faker-js/faker'
import _ from 'lodash'

export const initiativeData = () => ({
  url: faker.internet.url(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  latitude: Number(faker.location.latitude()),
  longitude: Number(faker.location.longitude()),
  description: faker.lorem.sentence(),
  badges: [],
  goals: []
})

export const insertInitiative = async (db) => {
  const row = await db
    .insertInto('initiatives')
    .values(_.omit(initiativeData(), ['badges', 'goals']))
    .returningAll()
    .executeTakeFirstOrThrow()
  return { ...row, type: 'Initiative' }
}
