import { client } from '../main'

type PlaceType = 'depots' | 'farms' | 'initiatives'

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

export async function getPlace(service: PlaceType, id: string) {
  return client.service(service).get(id)
}

export async function deletePlace(service: PlaceType, id: string) {
  return client.service(service).remove(id)
}

export async function getMyPlaces() {
  return client.service('entries').find({ query: { mine: true } })
}

interface PlaceMessage {
  id: string
  senderEmail: string
  senderName: string
  text: string
  type: string // TODO migrate to PlaceType (needs backend change)
}

export async function sendPlaceMessage(placeMessage: PlaceMessage) {
  debugger
  return client.service('entrycontactmessage').create(placeMessage)
}
