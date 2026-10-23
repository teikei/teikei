import type { Application } from '@feathersjs/feathers'
import axios from 'axios'
import filterAllowedFields from '../hooks/filterAllowedFields.ts'

// The fields of a HERE search result this API reads.
export type HereItem = {
  id: string
  title: string
  administrativeAreaType?: string
  address: {
    label?: string
    street?: string
    houseNumber?: string
    postalCode?: string
    city?: string
    state?: string
    countryName: string
    countryCode: string
  }
  position: { lat: number; lng: number }
}

export const countryMappings: Record<string, string> = {
  Deutschland: 'DEU',
  Österreich: 'AUT',
  Schweiz: 'CHE',
  Liechtenstein: 'LIE'
}

// TODO better error handling and param validation
export default (app: Application) => {
  const GEOCODING_URL = 'https://geocode.search.hereapi.com/v1/geocode'
  const LOOKUP_URL = 'https://lookup.search.hereapi.com/v1/lookup'
  const config = app.get('search')

  const parseGeocoderResponse = (item?: HereItem) => {
    if (!item) {
      throw new Error('No geocoding results found')
    }

    const address = item.address
    const position = item.position

    return {
      id: item.id,
      street: address.street,
      houseNumber: address.houseNumber || null,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      country: countryMappings[address.countryName] || address.countryName,
      longitude: position.lng,
      latitude: position.lat
    }
  }

  const service = {
    create: async (data: {
      locationid?: string
      q?: string
      searchtext?: string
    }) => {
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
