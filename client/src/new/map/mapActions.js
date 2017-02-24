import request from 'superagent'
import Alert from 'react-s-alert';
import { config } from '../App';

export const FETCH_ALL_PLACES_SUCCESS = 'FETCH_ALL_PLACES_SUCCESS'
export const FETCH_ALL_PLACES_ERROR = 'FETCH_ALL_PLACES_ERROR'

const baseUrl = () => config.baseUrl

export const fetchAllPlacesSuccess = payload =>
  ({ type: FETCH_ALL_PLACES_SUCCESS, payload, error: true })

export const fetchAllPlacesError = (payload) => {
  Alert.error('Die Karte konnte nicht geladen werden.')
  return ({ type: FETCH_ALL_PLACES_ERROR, payload, error: true })
}
export const fetchAllPlaces = payload => (dispatch) => {
  request
    .get(`${baseUrl()}/places`, { user: payload })
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchAllPlacesError(res.body.errors))
      } else {
        dispatch(fetchAllPlacesSuccess(res.body))
      }
    })
}
