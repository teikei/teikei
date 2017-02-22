import request from 'superagent'
import { browserHistory } from 'react-router'
import Alert from 'react-s-alert';

export const ENTRY_NEW_DEPOT = 'ENTRY_NEW_DEPOT'
export const ENTRY_NEW_FARM = 'ENTRY_NEW_FARM'

export const ENTRY_EDIT_DEPOT = 'ENTRY_EDIT_DEPOT'
export const ENTRY_EDIT_FARM = 'ENTRY_EDIT_FARM'

export const ENTRY_DELETE_PLACE = 'ENTRY_DELETE_PLACE'

const mapDepotToApiParams = payload => ({
  delivery_days: payload.delivery_days,
  description: payload.description,
  address: payload.geocoder.address,
  city: payload.geocoder.locality,
  latitude: payload.geocoder.latitude,
  longitude: payload.geocoder.longitude,
  name: payload.name,
  places: payload.places || null,
})

const mapFarmToApiParams = payload => ({
  // TODO
})

export const savePlaceError = (payload) => {
  Alert.error(`Dein Eintrag <strong>${payload.name}</strong> konnte nicht gespeichert werden: ${payload.error}`)
}

export const savePlaceSuccess = payload => () => {
  Alert.success(`Dein Eintrag <strong>${payload.name}</strong> wurde erfolgreich gespeichert.`)
}

export const newDepot = () => ({ type: ENTRY_NEW_DEPOT })
export const editDepot = () => ({ type: ENTRY_EDIT_DEPOT })
export const createDepot = payload => (dispatch) => {
  request
    .post('/api/v1/depots', mapDepotToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}
export const updateDepot = payload => (dispatch) => {
  request
    .post('/api/v1/depots', mapDepotToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const newFarm = () => ({ type: ENTRY_NEW_FARM })
export const editFarm = () => ({ type: ENTRY_EDIT_FARM })
export const createFarm = payload => (dispatch) => {
  request
    .post('/api/v1/farms', mapFarmToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}
export const updateFarm = payload => (dispatch) => {
  request
    .put('/api/v1/farms', mapFarmToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(savePlaceError(res.body.errors))
      } else {
        dispatch(savePlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}
