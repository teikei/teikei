import { client } from './clients.ts'
import {
  PlaceType,
  Farm,
  Depot,
  Initiative,
  PlaceMessage
} from '../types/types'

export async function getAutocompleteSuggestions(
  text: string,
  withEntries = false
) {
  return client
    .service('autocomplete')
    .create({ text }, withEntries ? { query: { entries: true } } : {})
}

export async function geocode(locationid: string) {
  return client.service('geocoder').create({ locationid })
}

export async function getEntries() {
  return client.service('entries').find()
}

export async function getMyEntries() {
  return client.service('entries').find({ query: { mine: true } })
}

export async function getPlace(type: PlaceType, id: string) {
  return client.service(type).get(id)
}

export async function getMyPlace(type: PlaceType, id: string) {
  const ownershipCheck = await client
    .service('entries')
    .find({ query: { mine: true, type, id } })
  if (ownershipCheck.features.length !== 1) {
    throw new Error('Unauthorized')
  }
  return client.service(`${type.toLowerCase()}s`).get(id)
}

export async function deletePlace(type: PlaceType, id: string) {
  return client.service(type).remove(id)
}

export async function getProducts() {
  return client.service('products').find()
}

export async function getGoals() {
  return client.service('goals').find()
}

export async function getBadges() {
  return client.service('badges').find()
}

export const mapDepotToApiParams = (payload: any) => ({
  ...payload,
  farms: payload.farms ? payload.farms.map((p: Farm) => p.id) : []
})

export async function createDepot(depot: Depot) {
  return client.service('depots').create(mapDepotToApiParams(depot))
}

export async function updateDepot(depot: Depot) {
  return client.service('depots').patch(depot.id, mapDepotToApiParams(depot))
}

export async function createFarm(farm: Farm) {
  return client.service('farms').create(farm)
}

export async function updateFarm(farm: Farm) {
  return client.service('farms').patch(farm.id, farm)
}

export async function createInitiative(initiative: Initiative) {
  return client.service('initiatives').create(initiative)
}

export async function updateInitiative(initiative: Initiative) {
  return client.service('initiatives').patch(initiative.id, initiative)
}

export async function sendPlaceMessage(placeMessage: PlaceMessage) {
  return client.service('entrycontactmessage').create(placeMessage)
}
