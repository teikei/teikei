import axios from 'axios'
import { disallow } from 'feathers-hooks-common'
import filterAllowedFields from '../hooks/filterAllowedFields'
import { countryMappings } from './geocoder'

export default (app) => {
  const REVERSE_GEOCODING_URL =
    'https://revgeocode.search.hereapi.com/v1/revgeocode'
  const config = app.get('search')

  const parseGeocoderResponse = (data) => {
    if (!data.items) {
      throw new Error('No reverse geocoding results found')
    }

    const item = data.items[0]

    const address = item.address
    const position = item.position

    return {
      id: item.id,
      street: address.street,
      houseNumber: address.houseNumber,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      country: countryMappings[address.countryCode] || address.countryName,
      longitude: position.lng,
      latitude: position.lat
    }
  }

  const service = {
    create: async (data) => {
      const response = await axios.get(REVERSE_GEOCODING_URL, {
        params: {
          apikey: config.apiKey,
          at: `${data.latitude},${data.longitude}`,
          limit: 1,
          types: 'address'
        }
      })
      return parseGeocoderResponse(response.data)
    }
  }

  app.use('/reverseGeocoder', service)
  app.service('reverseGeocoder').hooks({
    before: {
      create: [disallow('external')]
    },
    after: {
      create: [filterAllowedFields]
    }
  })
}
