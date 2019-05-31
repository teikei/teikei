import axios from 'axios'
import filterAllowedFields from '../hooks/filterAllowedFields'

const countryMappings = {
  DEU: 'Deutschland',
  AUT: 'Österreich',
  CHE: 'Schweiz',
  LIE: 'Liechtenstein'
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
  app
    .service('geocoder')
    .hooks({
      before: {
        all: [],
        create: []
      },
      after: {
        all: [],
        create: []
      },
      error: {
        all: [],
        create: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })
}
