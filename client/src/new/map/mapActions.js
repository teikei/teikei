import request from 'superagent'
import Alert from 'react-s-alert';
import config from '../configuration'

export const FETCH_ALL_PLACES_REQUESTED = 'FETCH_ALL_PLACES_REQUESTED'
export const FETCH_ALL_PLACES_SUCCESS = 'FETCH_ALL_PLACES_SUCCESS'
export const FETCH_ALL_PLACES_ERROR = 'FETCH_ALL_PLACES_ERROR'
export const SHOW_POSITION = 'SHOW_POSITION'
export const SET_COUNTRY = 'SET_COUNTRY'
export const ADD_PLACE = 'ADD_PLACE'
export const UPDATE_PLACE = 'UPDATE_PLACE'
export const DELETE_PLACE = 'DELETE_PLACE'

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
    .get(`${config.apiBaseUrl}/places`, { user })
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

export const setCountry = country => ({ type: SET_COUNTRY, payload: country })

export const addPlaceToMap = place => ({
  type: ADD_PLACE,
  payload: place,
})

export const updatePlaceOnMap = place => ({
  type: UPDATE_PLACE,
  payload: place,
})

export const deletePlaceFromMap = id => ({
  type: DELETE_PLACE,
  payload: { id },
})
