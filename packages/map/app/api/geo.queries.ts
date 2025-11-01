import { queryOptions } from '@tanstack/react-query'
import { geocode, getAutocompleteSuggestions } from '~/api/geo.api'

export const getAutocompleteSuggestionsQuery = (
  text?: string,
  locale: string = 'de-DE',
  withEntries: boolean = true
) =>
  queryOptions({
    queryKey: ['autocomplete', text, locale, withEntries],
    queryFn: () => {
      if (!text) {
        return []
      }
      return getAutocompleteSuggestions({ text, withEntries, locale })
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
