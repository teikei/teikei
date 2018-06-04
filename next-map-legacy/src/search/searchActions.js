import Alert from 'react-s-alert'
import request from '../common/request'
import config from '../configuration'
import { showPosition } from '../map/mapActions'

export const AUTOCOMPLETE_SEARCH = 'AUTOCOMPLETE_SEARCH'
export const AUTOCOMPLETE_SEARCH_SUCCESS = 'AUTOCOMPLETE_SEARCH_SUCCESS'
export const AUTOCOMPLETE_SEARCH_ERROR = 'AUTOCOMPLETE_SEARCH_ERROR'
export const SHOW_GEOCODE_POSITION_SUCCESS = 'SHOW_GEOCODE_POSITION_SUCCESS'
export const SHOW_GEOCODE_POSITION_ERROR = 'SHOW_GEOCODE_POSITION_ERROR'

const autoCompleteSearchSuccess = payload => ({
  type: AUTOCOMPLETE_SEARCH_SUCCESS,
  payload
})

const autoCompleteSearchError = payload => {
  Alert.error('Suchresultate konnten nicht geladen werden.')
  return { type: AUTOCOMPLETE_SEARCH_ERROR, payload, error: true }
}

export const autoCompleteSearch = value => dispatch => {
  request
    .get(`${config.apiBaseUrl}/search/autocomplete`)
    .withCredentials()
    .query({ text: value })
    .end((err, res) => {
      if (err) {
        dispatch(autoCompleteSearchError(err))
      } else {
        let locations = []
        locations = locations.concat(
          res.body.map(location => ({
            key: location.id,
            ...location
          }))
        )
        dispatch(autoCompleteSearchSuccess(locations))
      }
    })
}

const showGeocodePositionSuccess = payload => ({
  type: SHOW_GEOCODE_POSITION_SUCCESS,
  payload
})

const showGeocodePositionError = payload => {
  Alert.error('Die Position des Orts konnte nicht gefunden werden.')
  return { type: SHOW_GEOCODE_POSITION_ERROR, payload, error: true }
}

const geocode = successAction => id => dispatch => {
  request
    .get(`${config.apiBaseUrl}/search/geocode`)
    .withCredentials()
    .query({ id })
    .end((err, result) => {
      if (err) {
        dispatch(showGeocodePositionError(err))
      } else {
        const location = result.body[0]
        dispatch(
          successAction({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            ...location
          })
        )
      }
    })
}

export const geocodeAndShowOnMap = geocode(showPosition)
export const geocodeAndShowOnPreviewTile = geocode(showGeocodePositionSuccess)
