import type { Application, Params } from '@feathersjs/feathers'
import axios from 'axios'
import pgEscape from 'pg-escape'
import { withFeathersErrors } from '../db/errors.ts'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'
import { logger } from '../logger.ts'
import { createEntriesSearchRepository } from '../repositories/entriesSearch.ts'
import type { HereItem } from './geocoder.ts'

// TODO better error handling and param validation
type Suggestion = {
  id: string
  title: string
  position: HereItem['position']
  type: 'location'
  administrativeAreaType?: string
  countryCode: string
}

export default (app: Application) => {
  logger.info(JSON.stringify(app.get('search')))
  const AUTOCOMPLETE_URL =
    'https://autocomplete.search.hereapi.com/v1/autocomplete'
  const config = app.get('search')
  const entriesSearch = createEntriesSearchRepository(app.get('kysely'))

  const parseSuggestion = (item: HereItem): Suggestion | null => {
    if (!item.address) {
      return null
    }

    const { id, title, position, address, administrativeAreaType } = item
    return {
      id,
      title: address.label || title,
      position,
      type: 'location',
      administrativeAreaType,
      countryCode: address.countryCode
    }
  }

  const service = {
    create: async (data: { text: string; locale?: string }, params: Params) => {
      const response = await axios.get<{ items?: HereItem[] }>(
        AUTOCOMPLETE_URL,
        {
          params: {
            apikey: config.apiKey,
            q: data.text,
            lang: (data.locale && data.locale.split('-')[0]) || 'de',
            in: 'countryCode:DEU,AUT,CHE',
            limit: 20
          }
        }
      )

      const mergeWithEntries = async (s: Suggestion[]) => {
        const sanitizedText = data.text
          .replace(/[&|!()':@]/g, ' ')
          .replace(/\\/g, '')
          .replace(/\s+/g, ' ')
          .trim()

        if (!sanitizedText || sanitizedText.length > 100) {
          return s
        }

        const searchTerm = sanitizedText
          .split(' ')
          .filter((word) => word.length > 0)
          .map((word) => pgEscape.literal(word).slice(1, -1) + ':*')
          .join(' & ')

        const entries = await withFeathersErrors(
          entriesSearch.findMatches(searchTerm)
        )

        return entries.concat(s)
      }
      const suggestions =
        (response.data.items &&
          response.data.items.map(parseSuggestion).filter((s) => s !== null)) ||
        []
      // The REST transport always sets a query.
      return params.query!.entries ? mergeWithEntries(suggestions) : suggestions
    }
  }

  app.use('/autocomplete', service)
  app.service('autocomplete').hooks({
    after: {
      create: [filterAllowedFields]
    }
  })
}
