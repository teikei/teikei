import authentication from '@feathersjs/authentication/lib/index'
import axios from 'axios'

import { restrictToUser } from '../hooks/authorization'

// TODO better error handling and param validation
export default app => {
  const GEOCODING_URL = 'https://geocoder.cit.api.here.com/6.2/geocode.json'
  const config = app.get('search')

  const parseGeocoderResponse = response => {
    // TODO make this null-safe
    const location = response.data.Response.View[0].Result[0].Location
    const {
      Address: { Label, Street, HouseNumber, City, Country },
      DisplayPosition: { Longitude, Latitude },
      LocationId
    } = location
    return {
      name: Label,
      lon: Longitude,
      lat: Latitude,
      id: LocationId,
      address: [Street, HouseNumber].join(' ').trim(),
      city: City,
      country: Country
    }
  }

  const service = {
    create: async data => {
      const response = await axios.get(GEOCODING_URL, {
        params: { ...config, locationid: data.locationid }
      })
      return parseGeocoderResponse(response)
    }
  }

  app.use('/geocoder', service)
  app.service('geocoder').hooks({
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
