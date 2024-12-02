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
    'https://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json'
  const config = { ...app.get('search'), ...app.get('autocomplete') }

  const parseSuggestion = (item) => {
    if (['country', 'state', 'county'].includes(item.matchLevel)) {
      return null
    }

    const {
      address: { street, houseNumber, postalCode, city, state, country },
      locationId: id
    } = item

    return {
      id,
      street,
      houseNumber,
      postalCode,
      city,
      state,
      country,
      type: 'location'
    }
  }

  const service = {
    create: async (data, params) => {
      const response = await axios.get(AUTOCOMPLETE_URL, {
        params: {
          ...config,
          query: data.text,
          language: (data.locale && data.locale.split('-')[0]) || 'de'
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
        (response.data.suggestions &&
          _.compact(response.data.suggestions.map(parseSuggestion))) ||
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
