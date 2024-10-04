import { client } from '../main'

type PlaceType = 'depot' | 'farm' | 'initiative'

function typeToService(type: PlaceType) {
  return `${type}s`
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

export async function getPlace(type: PlaceType, id: string) {
  return client.service(typeToService(type)).get(id)
}

export async function deletePlace(type: PlaceType, id: string) {
  return client.service(typeToService(type)).remove(id)
}

export async function getMyPlaces() {
  return client.service('entries').find({ query: { mine: true } })
}
