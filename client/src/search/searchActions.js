import Alert from 'react-s-alert'
import request from '../common/request'
import config from '../configuration'

export const AUTOCOMPLETE_UPDATE_VALUE = 'AUTOCOMPLETE_UPDATE_VALUE'
export const AUTOCOMPLETE_SEARCH = 'AUTOCOMPLETE_SEARCH'
export const AUTOCOMPLETE_SEARCH_SUCCESS = 'AUTOCOMPLETE_SEARCH_SUCCESS'
export const AUTOCOMPLETE_SEARCH_ERROR = 'AUTOCOMPLETE_SEARCH_ERROR'
export const SHOW_GEOCODE_POSITION = 'SHOW_GEOCODE_POSITION'
export const SHOW_GEOCODE_POSITION_SUCCESS = 'SHOW_GEOCODE_POSITION_SUCCESS'
export const SHOW_GEOCODE_POSITION_ERROR = 'SHOW_GEOCODE_POSITION_ERROR'

const autoCompleteUpdateValue = payload => ({
  type: AUTOCOMPLETE_UPDATE_VALUE,
  payload
})

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

const showShowGeocodePositionSuccess = payload => ({
  type: SHOW_GEOCODE_POSITION_SUCCESS,
  payload
})

const showShowGeocodePositionError = payload => {
  Alert.error('Die Position des Orts konnte nicht gefunden werden.')
  return { type: SHOW_GEOCODE_POSITION_ERROR, payload, error: true }
}

export const showShowGeocodePosition = id => dispatch => {
  request
    .get(`${config.apiBaseUrl}/search/geocode`)
    .withCredentials()
    .query({ id })
    .end((err, result) => {
      if (err) {
        dispatch(showShowGeocodePositionError(err))
      } else {
        const location = result.body[0]
        dispatch(
          showShowGeocodePositionSuccess({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            ...location
          })
        )
      }
    })
}

export const autoComplete = value => dispatch => {
  dispatch(autoCompleteUpdateValue(value))
  dispatch(autoCompleteSearch(value))
}
