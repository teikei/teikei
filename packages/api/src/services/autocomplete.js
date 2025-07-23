import axios from 'axios'
import _ from 'lodash'
import { raw } from 'objection'

import pgEscape from 'pg-escape'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { logger } from '../logger'
import EntriesSearch from '../models/entriesSearch'

// TODO better error handling and param validation
export default (app) => {
  logger.info(JSON.stringify(app.get('search')))
  const AUTOCOMPLETE_URL =
    'https://autosuggest.search.hereapi.com/v1/autosuggest'
  const config = app.get('search')

  const parseSuggestion = (item) => {
    if (
      !item.address ||
      ['country', 'state', 'county', 'locality'].includes(item.resultType)
    ) {
      return null
    }

    const { id, title, position, address } = item
    return { id, title: address.label || title, position, type: 'location' }
  }

  const service = {
    create: async (data, params) => {
      const response = await axios.get(AUTOCOMPLETE_URL, {
        params: {
          apikey: config.apiKey,
          q: data.text,
          lang: (data.locale && data.locale.split('-')[0]) || 'de',
          in: 'bbox:5.866,45.818,15.042,55.058',
          limit: 20
        }
      })

      const mergeWithEntries = async (s) => {
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

        const entries = await EntriesSearch.query()
          .select('name as title', 'id', 'type')
          .where(raw(`search @@ to_tsquery(?)`, [searchTerm]))
          .orderBy(raw(`ts_rank(search, to_tsquery(?))`, [searchTerm]), 'desc')
          .limit(5)

        return entries.concat(s)
      }
      const suggestions =
        (response.data.items &&
          _.compact(response.data.items.map(parseSuggestion))) ||
        []
      return params.query.entries ? mergeWithEntries(suggestions) : suggestions
    }
  }

  app.use('/autocomplete', service)
  app.service('autocomplete').hooks({
    after: {
      create: [filterAllowedFields]
    }
  })
}
