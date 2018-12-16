import axios from 'axios'
import { disallow } from 'feathers-hooks-common'

import filterAllowedFields from '../hooks/filterAllowedFields'

const countryMappings = {
  DEU: 'Deutschland',
  CH: 'Schweiz'
}

export default app => {
  const REVERSE_GEOCODING_URL =
    'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json'
  const config = app.get('search')

  const parseGeocoderResponse = response => {
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
      const response = await axios.get(REVERSE_GEOCODING_URL, {
        params: {
          ...config,
          prox: `${data.latitude},${data.longitude},200`,
          mode: 'retrieveAddress',
          maxResults: 1
        }
      })
      return parseGeocoderResponse(response)
    }
  }

  app.use('/reverseGeocoder', service)
  app
    .service('reverseGeocoder')
    .hooks({
      before: {
        all: [disallow('external')],
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
