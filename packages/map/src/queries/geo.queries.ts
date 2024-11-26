import { queryOptions } from '@tanstack/react-query'
import { geocode, getAutocompleteSuggestions } from './geo.api'

export const getAutocompleteSuggestionsQuery = (text?: string) =>
  queryOptions({
    queryKey: ['autocomplete', text],
    queryFn: () => {
      if (!text) {
        return []
      }
      return getAutocompleteSuggestions({ text, withEntries: true })
    }
  })

export const geocodeLocationIdQuery = (locationid?: string) =>
  queryOptions({
    queryKey: ['geocode', locationid],
    queryFn: async () => {
      if (!locationid) {
        return null
      }
      return geocode({ locationid })
    }
  })
