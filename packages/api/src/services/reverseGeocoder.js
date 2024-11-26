import axios from 'axios'
import { disallow } from 'feathers-hooks-common'
import _ from 'lodash'
import filterAllowedFields from '../hooks/filterAllowedFields'

export default (app) => {
  const REVERSE_GEOCODING_URL =
    'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json'
  const config = app.get('search')

  const parseGeocoderResponse = (response) => {
    const location = response.data.Response.View[0].Result[0].Location

    const {
      Address: {
        Street,
        HouseNumber,
        City,
        PostalCode,
        Country,
        AdditionalData
      },
      DisplayPosition: { Longitude, Latitude },
      LocationId
    } = location
    return {
      id: LocationId,
      street: Street,
      houseNumber: HouseNumber,
      postalCode: PostalCode,
      city: City,
      state: _.get(
        AdditionalData.find((e) => e.key === 'StateName'),
        'value'
      ),
      country: Country,
      longitude: Longitude,
      latitude: Latitude
    }
  }

  const service = {
    create: async (data) => {
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
  app.service('reverseGeocoder').hooks({
    before: {
      create: [disallow('external')]
    },
    after: {
      create: [filterAllowedFields]
    }
  })
}
