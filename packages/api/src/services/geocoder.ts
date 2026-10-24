import { BadRequest } from '@feathersjs/errors'
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
    // ISO 3166-1 alpha-3, the format entries store
    countryCode: string
  }
  position: { lat: number; lng: number }
}

// TODO better error handling
export default (app: Application) => {
  const LOOKUP_URL = 'https://lookup.search.hereapi.com/v1/lookup'
  const config = app.get('search')

  const service = {
    create: async (data: { locationid?: string }) => {
      if (!data.locationid) {
        throw new BadRequest('locationid is required')
      }

      const response = await axios.get<HereItem>(LOOKUP_URL, {
        params: {
          apikey: config.apiKey,
          id: data.locationid
        }
      })
      const { id, address, position } = response.data

      return {
        id,
        street: address.street,
        houseNumber: address.houseNumber || null,
        postalCode: address.postalCode,
        city: address.city,
        state: address.state,
        country: address.countryCode,
        longitude: position.lng,
        latitude: position.lat
      }
    }
  }

  app.use('/geocoder', service)
  app.service('geocoder').hooks({
    after: {
      create: [filterAllowedFields]
    }
  })
}
