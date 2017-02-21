import request from 'superagent'
import { browserHistory } from 'react-router'
import Alert from 'react-s-alert';

export const ENTRY_ADD_DEPOT = 'ENTRY_ADD_DEPOT'
export const ENTRY_ADD_FARM = 'ENTRY_ADD_FARM'

export const ENTRY_EDIT_DEPOT = 'ENTRY_EDIT_DEPOT'
export const ENTRY_EDIT_FARM = 'ENTRY_EDIT_FARM'

export const ENTRY_DELETE_FARM = 'ENTRY_DELETE_FARM'
export const ENTRY_DELETE_DEPOT = 'ENTRY_DELETE_DEPOT'

export const ENTRY_SHOW_MY_ENTRIES = 'ENTRY_SHOW_MY_ENTRIES'

export const showMyEntries = () => ({ type: ENTRY_SHOW_MY_ENTRIES })

export const addDepot = () => ({ type: ENTRY_ADD_DEPOT })
export const beginAddDepot = () => (dispatch) => {
  browserHistory.push('/new/depots/add')
  dispatch(addDepot())
}

function mapToApiParams(payload) {
  return {
    delivery_days: payload.delivery_days,
    description: payload.description,
    address: payload.geocoder.address,
    city: payload.geocoder.locality,
    latitude: payload.geocoder.latitude,
    longitude: payload.geocoder.longitude,
    name: payload.name,
    places: payload.places || null,
  }
}

export const createDepotError = () => {
}
export const createDepotSuccess = payload => () => {
  Alert.success(`Dein Eintrag <strong>${payload.name}</strong> wurde erfolgreich gespeichert.`)
}

export const createDepot = payload => (dispatch) => {
  request
    .post('/api/v1/depots', mapToApiParams(payload))
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(createDepotError(res.body.errors))
      } else {
        dispatch(createDepotSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const addFarm = () => ({ type: ENTRY_ADD_FARM })
export const beginAddFarm = () => (dispatch) => {
  browserHistory.push('/new/farms/add')
  dispatch(addFarm())
}
export const createFarm = payload => (dispatch) => {
  console.log(payload)
}
