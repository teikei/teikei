import { getClient } from '~/lib/clients'

interface GetAutocompleteSuggestionParams {
  text: string
  withEntries?: boolean
  locale?: string
}

export async function getAutocompleteSuggestions(
  getAutocompleteSuggestionsParams: GetAutocompleteSuggestionParams
) {
  const { text, withEntries, locale } = getAutocompleteSuggestionsParams
  return getClient()
    .service('autocomplete')
    .create({ text, locale }, withEntries ? { query: { entries: true } } : {})
}

interface GeocodeParams {
  locationid: string
}

export async function geocode(geocodeParams: GeocodeParams) {
  return getClient().service('geocoder').create(geocodeParams)
}
