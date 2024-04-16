/*  __
___( o)>
\ <_. )
 `---'
*/
import Alert from 'react-s-alert'
import { SET_COUNTRY, showPosition } from '../Map/duck'
import { client } from '../../main'

export const AUTOCOMPLETE_SEARCH = 'AUTOCOMPLETE_SEARCH'
export const AUTOCOMPLETE_SEARCH_SUCCESS = 'AUTOCOMPLETE_SEARCH_SUCCESS'
export const AUTOCOMPLETE_SEARCH_ERROR = 'AUTOCOMPLETE_SEARCH_ERROR'
export const SHOW_GEOCODE_POSITION_SUCCESS = 'SHOW_GEOCODE_POSITION_SUCCESS'
export const SHOW_GEOCODE_POSITION_ERROR = 'SHOW_GEOCODE_POSITION_ERROR'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'

const initialState = { items: [], value: '', loading: false }

export const search = (state = initialState, action) => {
  switch (action.type) {
    case AUTOCOMPLETE_SEARCH:
      return { ...state, loading: true }
    case AUTOCOMPLETE_SEARCH_SUCCESS:
      return {
        ...state,
        items:
          action.payload && action.payload.map((l) => ({ key: l.id, ...l })),
        loading: false,
      }

    case SHOW_GEOCODE_POSITION_SUCCESS:
      return { ...state, geocodePosition: action.payload }

    case SET_COUNTRY:
    case CLEAR_SEARCH:
      return initialState

    default:
      return state
  }
}

export const clearSearch = (payload) => ({
  type: CLEAR_SEARCH,
  payload,
})

const autoCompleteSearchSuccess = (payload) => ({
  type: AUTOCOMPLETE_SEARCH_SUCCESS,
  payload,
})

const autoCompleteSearchError = (payload) => {
  Alert.error('Suchresultate konnten nicht geladen werden.')
  return { type: AUTOCOMPLETE_SEARCH_ERROR, payload, error: true }
}

export const autoCompleteSearch = (value, withEntries = false) => {
  return (dispatch) => {
    return client
      .service('autocomplete')
      .create({ text: value }, withEntries ? { query: { entries: true } } : {})
      .then((suggestions) => dispatch(autoCompleteSearchSuccess(suggestions)))
      .catch((e) => dispatch(autoCompleteSearchError(e)))
  }
}

const showGeocodePositionSuccess = (payload) => ({
  type: SHOW_GEOCODE_POSITION_SUCCESS,
  payload,
})

const showGeocodePositionError = (payload) => {
  Alert.error('Die Position des Orts konnte nicht gefunden werden.')
  return { type: SHOW_GEOCODE_POSITION_ERROR, payload, error: true }
}

const geocode = (successAction) => (id) => (dispatch) => {
  return client
    .service('geocoder')
    .create({ locationid: id })
    .then((location) =>
      dispatch(
        successAction({
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          ...location,
        }),
      ),
    )
    .catch((e) => dispatch(showGeocodePositionError(e)))
}

export const geocodeAndShowOnMap = geocode(showPosition)
export const geocodeAndShowOnPreviewTile = geocode(showGeocodePositionSuccess)
