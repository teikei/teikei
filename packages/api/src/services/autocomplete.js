import axios from 'axios'
import _ from 'lodash'
import { raw } from 'objection'
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
    // Skip administrative areas and countries
    if (
      !item.address ||
      ['country', 'state', 'county', 'locality'].includes(item.resultType)
    ) {
      return null
    }

    const { id, title, position, resultType } = item
    return { id, title, position, resultType, type: 'location' }
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
        const entries = await EntriesSearch.query()
          .select('name', 'id', 'type')
          .where(raw(`search @@ plainto_tsquery('${data.text}')`))
          .orderBy(
            raw(`ts_rank(search,plainto_tsquery('${data.text}'))`),
            'desc'
          )
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
