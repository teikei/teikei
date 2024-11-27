import { client } from './clients.ts'

interface GetAutocompleteSuggestionParams {
  text: string
  withEntries?: boolean
  locale?: string
}

export async function getAutocompleteSuggestions(
  getAutocompleteSuggestionsParams: GetAutocompleteSuggestionParams
) {
  const { text, withEntries, locale } = getAutocompleteSuggestionsParams
  return client
    .service('autocomplete')
    .create({ text, locale }, withEntries ? { query: { entries: true } } : {})
}

interface GeocodeParams {
  locationid: string
}

export async function geocode(geocodeParams: GeocodeParams) {
  return client.service('geocoder').create(geocodeParams)
}
