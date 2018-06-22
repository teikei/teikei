import Alert from 'react-s-alert'
import { showPosition } from '../map/mapActions'
import { client } from '../App'

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

export const autoCompleteSearch = value => dispatch =>
  client
    .service('autocomplete')
    .create({ text: value })
    .then(suggestions => dispatch(autoCompleteSearchSuccess(suggestions)))
    .catch(e => dispatch(autoCompleteSearchError(e)))

const showGeocodePositionSuccess = payload => ({
  type: SHOW_GEOCODE_POSITION_SUCCESS,
  payload
})

const showGeocodePositionError = payload => {
  Alert.error('Die Position des Orts konnte nicht gefunden werden.')
  return { type: SHOW_GEOCODE_POSITION_ERROR, payload, error: true }
}

const geocode = successAction => id => dispatch =>
  client
    .service('geocoder')
    .create({ locationid: id })
    .then(location =>
      dispatch(
        successAction({
          lat: parseFloat(location.lat),
          lon: parseFloat(location.lon),
          ...location
        })
      )
    )
    .catch(e => dispatch(showGeocodePositionError(e)))

export const geocodeAndShowOnMap = geocode(showPosition)
export const geocodeAndShowOnPreviewTile = geocode(showGeocodePositionSuccess)
