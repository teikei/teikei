import Alert from 'react-s-alert';
import request, { handleValidationErrors } from '../common/request'
import { history, MY_ENTRIES, MAP } from '../AppRouter'
import config from '../configuration'

export const INIT_CREATE_DEPOT_EDITOR = 'INIT_CREATE_DEPOT_EDITOR'
export const INIT_CREATE_FARM_EDITOR = 'INIT_CREATE_FARM_EDITOR'

export const FETCH_PLACE_FOR_EDITING_SUCCESS = 'FETCH_PLACE_FOR_EDITING_SUCCESS'

const mapDepotToApiParams = ({ ...payload, geocoder = {} }) => ({
  delivery_days: payload.delivery_days,
  description: payload.description,
  address: geocoder.address,
  city: geocoder.city,
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
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}
export const fetchPlaceSuccess = place => ({
  type: FETCH_PLACE_FOR_EDITING_SUCCESS,
  payload: {
    place,
  },
})

export const savePlaceError = ({ response, status, message }) => {
  if (status === 401) {
    Alert.error('Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldest bist.')
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
    handleValidationErrors(response)
  } else {
    Alert.error(`Dein Eintrag konnte nicht gespeichert werden / ${message}`)
  }
}
export const savePlaceSuccess = ({ body }) => {
  Alert.success(`Dein Eintrag <strong>${body.name}</strong> wurde erfolgreich gespeichert.`)
  history.push(MAP);
}

export const deletePlaceError = ({ message }) => {
  Alert.error(`Dein Eintrag konnte nicht gelöscht werden / ${message}`)
}
export const deletePlaceSuccess = () => {
  Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
  history.push(MY_ENTRIES);
}

// CREATE

export const initializeCreateDepotEditor = () => ({
  type: INIT_CREATE_DEPOT_EDITOR,
})
export const createDepot = depot => () => (
  request
    .post(`${config.apiBaseUrl}/depots`, mapDepotToApiParams(depot))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
)


export const initializeCreateFarmEditor = () => ({
  type: INIT_CREATE_FARM_EDITOR,
})
export const createFarm = farm => () => (
  request
    .post(`${config.apiBaseUrl}/farms`, mapFarmToApiParams(farm))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
)

// EDIT

export const initializeUpdateDepotEditor = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/depots/${id}`)
    .then(result => dispatch(fetchPlaceSuccess(result.body)))
    .catch(fetchPlaceError)
}
export const updateDepot = depot => () => (
  request
    .post(`${config.apiBaseUrl}/depots`, mapDepotToApiParams(depot))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
)

export const initializeUpdateFarmEditor = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/farms/${id}`)
    .then(result => dispatch(fetchPlaceSuccess(result.body)))
    .catch(fetchPlaceError)
}
export const updateFarm = farm => () => (
  request
    .put(`${config.apiBaseUrl}/farms`, mapFarmToApiParams(farm))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
)

// DELETE

export const initializeDeletePlaceEditor = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/places/${id}`)
    .then(result => dispatch(fetchPlaceSuccess(result.body)))
    .catch(fetchPlaceError)
}
export const deletePlace = id => () => {
  request
    .del(`${config.apiBaseUrl}/places/${id}`)
    .then(deletePlaceSuccess)
    .catch(deletePlaceError)
}

