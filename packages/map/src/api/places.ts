import { client } from '../main'

type PlaceType = 'depots' | 'farms' | 'initiatives'

type Farm = {
  id: string
}

type Depot = {
  id: string
  farms: Farm[]
}

type Initiative = {
  id: string
}

type PlaceMessage = {
  id: string
  senderEmail: string
  senderName: string
  text: string
  type: string // TODO migrate to PlaceType (needs backend change)
}

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

export async function getPlace(service: PlaceType, id: string) {
  return client.service(service).get(id)
}

export async function getMyPlaces() {
  return client.service('entries').find({ query: { mine: true } })
}

export async function getMyPlace(type: string, id: string) {
  const ownershipCheck = await client
    .service('entries')
    .find({ query: { mine: true, type, id } })
  if (ownershipCheck.features.length !== 1) {
    throw new Error('Unauthorized')
  }
  return client.service(`${type.toLowerCase()}s`).get(id)
}

export async function deletePlace(service: PlaceType, id: string) {
  return client.service(service).remove(id)
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
