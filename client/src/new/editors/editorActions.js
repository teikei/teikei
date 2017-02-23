import request from 'superagent'
import { browserHistory } from 'react-router'
import Alert from 'react-s-alert';
import { MY_ENTRIES, ROOT } from '../AppRouter'

export const INIT_CREATE_DEPOT_EDITOR = 'INIT_CREATE_DEPOT_EDITOR'
export const INIT_CREATE_FARM_EDITOR = 'INIT_CREATE_FARM_EDITOR'

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

// RESPONSE ACTIONS

export const fetchPlaceError = (payload) => {
  Alert.success(`Der Eintrag konnte nicht geladet werden. ${payload.errors}`)
}
export const fetchPlaceSuccess = place => ({
  type: FETCH_PLACE_FOR_EDITING_SUCCESS,
  payload: {
    place,
  },
})

export const savePlaceError = (payload) => {
  Alert.error(`Dein Eintrag <strong>${payload.name}</strong> konnte nicht gespeichert werden: ${payload.error}`)
}
export const savePlaceSuccess = (payload) => {
  Alert.success(`Dein Eintrag <strong>${payload.name}</strong> wurde erfolgreich gespeichert.`)
  browserHistory.push(ROOT);
}

export const deletePlaceError = (payload) => {
  Alert.error(`Dein Eintrag <strong>${payload.name}</strong> konnte nicht gel&ouml;scht werden: ${payload.error}`)
}
export const deletePlaceSuccess = () => {
  Alert.success('Dein Eintrag wurde erfolgreich gel&ouml;scht.')
  browserHistory.push(MY_ENTRIES);
}

// CREATE

export const initializeCreateDepotEditor = () => ({
  type: INIT_CREATE_DEPOT_EDITOR,
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

export const initializeCreateFarmEditor = () => ({
  type: INIT_CREATE_FARM_EDITOR,
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

// EDIT

export const initializeUpdateDepotEditor = id => (dispatch) => {
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

export const initializeUpdateFarmEditor = id => (dispatch) => {
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

// DELETE

export const initializeDeletePlaceEditor = id => (dispatch) => {
  request
    .get(`/api/v1/places/${id}`)
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(fetchPlaceError(res.body.errors))
      } else {
        dispatch(fetchPlaceSuccess(res.body))
      }
    })
}
export const deletePlace = id => (dispatch) => {
  request
  .delete(`/api/v1/places/${id}`)
  .end((err, res) => {
    if (res.error) {
      dispatch(deletePlaceError(res.error))
    } else {
      dispatch(deletePlaceSuccess())
    }
  })
}

