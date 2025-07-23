import axios from 'axios'
import filterAllowedFields from '../hooks/filterAllowedFields'

export const countryMappings = {
  DEU: 'Deutschland',
  AUT: 'Österreich',
  CHE: 'Schweiz',
  LIE: 'Liechtenstein'
}

// TODO better error handling and param validation
export default (app) => {
  const GEOCODING_URL = 'https://geocode.search.hereapi.com/v1/geocode'
  const LOOKUP_URL = 'https://lookup.search.hereapi.com/v1/lookup'
  const config = app.get('search')

  const parseGeocoderResponse = (item) => {
    if (!item) {
      throw new Error('No geocoding results found')
    }

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
      let response

      if (data.locationid) {
        // Use lookup API for location IDs
        response = await axios.get(LOOKUP_URL, {
          params: {
            apikey: config.apiKey,
            id: data.locationid
          }
        })
      } else {
        // Use geocode API for address strings
        const query = data.q || data.searchtext || ''
        response = await axios.get(GEOCODING_URL, {
          params: {
            apikey: config.apiKey,
            q: query,
            limit: 1
          }
        })
      }

      return parseGeocoderResponse(response.data)
    }
  }

  app.use('/geocoder', service)
  app.service('geocoder').hooks({
    after: {
      create: [filterAllowedFields]
    }
  })
}
