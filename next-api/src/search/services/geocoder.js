import authentication from '@feathersjs/authentication/lib/index'
import axios from 'axios'

import { restrictToUser } from '../../auth/hooks/authorization'

// TODO better error handling and param validation
export default app => {
  const GEOCODING_URL = 'https://geocoder.cit.api.here.com/6.2/geocode.json'
  const config = app.get('search')

  const parseGeocoderResponse = response => {
    // TODO make this null-safe
    const location = response.data.Response.View[0].Result[0].Location
    return {
      name: location.Address.Label,
      lon: location.DisplayPosition.Longitude,
      lat: location.DisplayPosition.Latitude,
      id: location.LocationId,
      address: [location.Address.Street, location.Address.HouseNumber]
        .join(' ')
        .trim(),
      city: location.Address.City,
      country: location.Address.Country
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
      get: [authentication.hooks.authenticate('jwt'), restrictToUser]
    }
  })
}
