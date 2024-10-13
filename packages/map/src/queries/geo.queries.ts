import { queryOptions } from '@tanstack/react-query'

import { geocode, getAutocompleteSuggestions } from './geo.api'

export const getAutocompleteSuggestionsQuery = (autcompleteValue?: string) =>
  queryOptions({
    queryKey: ['autocomplete', autcompleteValue],
    queryFn: () => {
      if (!autcompleteValue) {
        return []
      }
      return getAutocompleteSuggestions(autcompleteValue)
    }
  })

export const geocodeLocationIdQuery = (locationId?: string) =>
  queryOptions({
    queryKey: ['geocode', locationId],
    queryFn: async () => {
      if (!locationId) {
        return null
      }
      return geocode(locationId)
    }
  })
