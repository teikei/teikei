import request from 'superagent'
import config from '../configuration'

export const GEOCODE_SUCCESS = 'GEOCODE_SUCCESS'
export const GEOCODE_ERROR = 'GEOCODE_ERROR'

const apiBaseUrl = () => config.apiBaseUrl

export const geocodeSuccess = payload => ({ type: GEOCODE_SUCCESS, payload })
export const geocodeError = payload => ({ type: GEOCODE_ERROR, payload, error: true })
export const geocode = payload => (dispatch) => {
  request
    .get(`${apiBaseUrl()}/geocode/search/structured`, payload)
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(geocodeError(res.body.errors))
      } else {
        const result = res.body
        if (result.length > 0) {
          dispatch(geocodeSuccess({
            latitude: result[0].lat,
            longitude: result[0].lon,
          }))
        } else {
          dispatch(geocodeError('nothing found'))
        }
      }
    })
}
