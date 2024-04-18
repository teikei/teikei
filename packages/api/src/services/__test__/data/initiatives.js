/* eslint-disable import/no-extraneous-dependencies */
import { faker } from "@faker-js/faker";
import Initiative from "../../../models/initiatives";

export const initiativeData = () => ({
  url: faker.internet.url(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  latitude: Number(faker.location.latitude()),
  longitude: Number(faker.location.longitude()),
  description: faker.lorem.sentence(),
  badges: [],
  goals: [],
});

export const insertInitiative = async () => {
  const initiative = initiativeData();
  return Initiative.query().insert(initiative);
};
