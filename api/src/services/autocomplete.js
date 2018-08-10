import authentication from '@feathersjs/authentication/lib/index'
import axios from 'axios'
import _ from 'lodash'
import { raw } from 'objection'

import { restrictToUser } from '../hooks/authorization'
import EntriesSearch from '../models/entriesSearch'

// TODO better error handling and param validation
// TODO implement place name fuzzy search
export default app => {
  const AUTOCOMPLETE_URL =
    'https://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json'
  const config = { ...app.get('search'), ...app.get('autocomplete') }

  const parseSuggestion = item => {
    if (['country', 'state', 'county'].includes(item.matchLevel)) {
      return null
    }
    return {
      name: item.label,
      id: item.locationId,
      type: 'location'
    }
  }

  const service = {
    create: async data => {
      const response = await axios.get(AUTOCOMPLETE_URL, {
        params: {
          ...config,
          query: data.text
        }
      })
      const entries = await EntriesSearch.query()
        .select('name', 'id', 'type')
        .where(raw("search @@ to_tsquery('??')", data.text))
        .orderBy(raw("ts_rank(search,to_tsquery('??'))", data.text), 'desc')
      return entries.concat(
        (response.data.suggestions &&
          _.compact(response.data.suggestions.map(parseSuggestion))) ||
          []
      )
    }
  }

  app.use('/autocomplete', service)
  app.service('autocomplete').hooks({
    before: {
      all: [],
      find: [],
      get: [authentication.hooks.authenticate('jwt'), restrictToUser],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
