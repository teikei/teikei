import request from 'superagent'
import { browserHistory } from 'react-router'
import Alert from 'react-s-alert';

export const ENTRY_ADD_DEPOT = 'ENTRY_ADD_DEPOT'
export const ENTRY_ADD_FARM = 'ENTRY_ADD_FARM'

export const ENTRY_EDIT_PLACE = 'ENTRY_EDIT_FARM'
export const ENTRY_DELETE_PLACE = 'ENTRY_DELETE_FARM'

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

export const createPlaceError = (payload) => {
  Alert.error(`Dein Eintrag <strong>${payload.name}</strong> konnte nicht gespeichert werden: ${payload.error}`)
}

export const createPlaceSuccess = payload => () => {
  Alert.success(`Dein Eintrag <strong>${payload.name}</strong> wurde erfolgreich gespeichert.`)
}

export const addDepot = () => ({ type: ENTRY_ADD_DEPOT })

export const beginAddDepot = () => (dispatch) => {
  browserHistory.push('/new/depots/new')
  dispatch(addDepot())
}

export const createDepot = payload => (dispatch) => {
  request
    .post('/api/v1/depots', mapDepotToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(createPlaceError(res.body.errors))
      } else {
        dispatch(createPlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const addFarm = () => ({ type: ENTRY_ADD_FARM })

export const beginAddFarm = () => (dispatch) => {
  browserHistory.push('/new/farms/new')
  dispatch(addFarm())
}

export const createFarm = payload => (dispatch) => {
  request
    .post('/api/v1/farms', mapFarmToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(createPlaceError(res.body.errors))
      } else {
        dispatch(createPlaceSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const editPlace = (payload) => {
  switch (payload.type){
    case 'Farm':
      browserHistory.push('/new');
    case 'Depot':
    default:
      Alert.error(`Dein Eintrag <strong>${payload.name}</strong> kann nicht bearbeitet werden: ${payload.error}`)


  }
}
