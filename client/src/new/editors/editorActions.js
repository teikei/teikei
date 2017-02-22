import request from 'superagent'
import { browserHistory } from 'react-router'
import Alert from 'react-s-alert';

export const NEW_DEPOT = 'NEW_DEPOT'
export const NEW_FARM = 'NEW_FARM'

export const DELETE_PLACE = 'DELETE_PLACE'

export const FETCH_PLACE_FOR_EDITING_SUCCESS = 'FETCH_PLACE_FOR_EDITING_SUCCESS'

const mapDepotToApiParams = ({ ...payload, geocoder = {} }) => ({
  delivery_days: payload.delivery_days,
  description: payload.description,
  address: geocoder.address,
  city: geocoder.locality,
  latitude: geocoder.latitude,
  longitude: geocoder.longitude,
  name: payload.name,
  places: payload.places || null,
})

const mapFarmToApiParams = payload => ({
  // TODO
  ...payload,
})

export const savePlaceError = (payload) => {
  Alert.error(`Dein Eintrag <strong>${payload.name}</strong> konnte nicht gespeichert werden: ${payload.error}`)
}
export const savePlaceSuccess = (payload) => {
  Alert.success(`Dein Eintrag <strong>${payload.name}</strong> wurde erfolgreich gespeichert.`)
  browserHistory.push('/new');
}
export const fetchPlaceError = (payload) => {
  Alert.success(`Der Eintrag konnte nicht geladet werden. ${payload.errors}`)
}
export const fetchPlaceSuccess = place => ({
  type: FETCH_PLACE_FOR_EDITING_SUCCESS,
  payload: {
    place,
  },
})

export const newDepot = () => ({
  type: NEW_DEPOT,
})
export const createDepot = depot => (dispatch) => {
  request
    .post('/api/v1/depots', mapDepotToApiParams(depot))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError({ errors: res.body.errors }))
      } else {
        dispatch(savePlaceSuccess(res.body))
      }
    })
}
export const editDepot = id => (dispatch) => {
  request
    .get(`/api/v1/depots/${id}`)
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchPlaceError(res.body.errors))
      } else {
        dispatch(fetchPlaceSuccess(res.body))
      }
    })
}
export const updateDepot = depot => (dispatch) => {
  request
    .post('/api/v1/depots', mapDepotToApiParams(depot))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchPlaceError(res.body.errors))
      } else {
        dispatch(fetchPlaceSuccess(res.body))
      }
    })
}

export const newFarm = () => ({
  type: NEW_FARM,
})
export const createFarm = farm => (dispatch) => {
  request
    .post('/api/v1/farms', mapFarmToApiParams(farm))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
      }
    })
}
export const editFarm = id => (dispatch) => {
  request
    .get(`/api/v1/farms/${id}`)
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchPlaceError(res.body.errors))
      } else {
        dispatch(fetchPlaceSuccess(res.body))
      }
    })
}
export const updateFarm = farm => (dispatch) => {
  request
    .put('/api/v1/farms', mapFarmToApiParams(farm))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
      }
    })
}

