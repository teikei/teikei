import axios from 'axios'

const countryMappings = {
  DEU: 'Deutschland',
  CH: 'Schweiz'
}

// TODO better error handling and param validation
export default app => {
  const GEOCODING_URL = 'https://geocoder.cit.api.here.com/6.2/geocode.json'
  const config = app.get('search')

  const parseGeocoderResponse = response => {
    // TODO make this null-safe
    const location = response.data.Response.View[0].Result[0].Location

    const {
      Address: { Street, HouseNumber, State, City, Country, PostalCode },
      DisplayPosition: { Longitude, Latitude },
      LocationId
    } = location
    return {
      id: LocationId,
      street: Street,
      houseNumber: HouseNumber,
      postalCode: PostalCode,
      city: City,
      state: State,
      country: countryMappings[Country],
      longitude: Longitude,
      latitude: Latitude
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
      get: [],
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
