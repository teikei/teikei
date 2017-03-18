import request from 'superagent'
import Alert from 'react-s-alert';
import config from '../configuration'

export const FETCH_ALL_PLACES_REQUESTED = 'FETCH_ALL_PLACES_REQUESTED'
export const FETCH_ALL_PLACES_SUCCESS = 'FETCH_ALL_PLACES_SUCCESS'
export const FETCH_ALL_PLACES_ERROR = 'FETCH_ALL_PLACES_ERROR'
export const SHOW_POSITION = 'SHOW_POSITION'
export const FETCH_PLACE_REQUESTED = 'FETCH_PLACE_REQUESTED'
export const FETCH_PLACE_SUCCESS = 'FETCH_PLACE_SUCCESS'

const apiBaseUrl = () => config.apiBaseUrl

const shouldFetchData = ({ isFetchingAll, places }) =>
 (!isFetchingAll || places.length < 1)

export const showPosition = payload =>
  ({ type: SHOW_POSITION, payload })

const fetchAllPlacesRequested = () =>
  ({ type: FETCH_ALL_PLACES_REQUESTED })

const fetchAllPlacesSuccess = payload =>
  ({ type: FETCH_ALL_PLACES_SUCCESS, payload })

const fetchAllPlacesError = (payload) => {
  Alert.error('Die Karte konnte nicht geladen werden.')
  return ({ type: FETCH_ALL_PLACES_ERROR, payload, error: true })
}

const fetchAllPlaces = user => dispatch => (
  request
    .get(`${apiBaseUrl()}/places`, { user })
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchAllPlacesError(res.body.errors))
      } else {
        dispatch(fetchAllPlacesSuccess(res.body))
      }
    })
)

export const requestAllPlaces = (options = {}) => (dispatch, getState) => {
  dispatch(fetchAllPlacesRequested())

  if (shouldFetchData(getState().map)) {
    return dispatch(fetchAllPlaces(options))
  }

  return dispatch(fetchAllPlacesSuccess(getState().map.places))
}

const fetchPlaceRequested = () =>
  ({ type: FETCH_PLACE_REQUESTED })

const fetchPlaceSuccess = place =>
  ({ type: FETCH_PLACE_SUCCESS, payload: place })

const fetchPlaceError = (payload) => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}

export const showPlace = (type, id) => (dispatch) => {
  dispatch(fetchPlaceRequested())

  request
    .get(`${apiBaseUrl()}/${type}/${id}`)
    .then(result => dispatch(fetchPlaceSuccess(result.body)))
    .catch(fetchPlaceError)
}

