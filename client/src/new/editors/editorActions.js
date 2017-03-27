import Alert from 'react-s-alert';
import request from '../common/request'
import { history, MY_ENTRIES, MAP } from '../AppRouter'
import config from '../configuration'

export const INIT_CREATE_PLACE = 'INIT_CREATE_PLACE'
export const INIT_EDIT_PLACE_SUCCESS = 'INIT_FETCH_PLACE_SUCCESS'

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

export const initEditPlaceError = (payload) => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}
export const initEditPlaceSuccess = place => ({
  type: INIT_EDIT_PLACE_SUCCESS,
  payload: {
    place,
  },
})

export const savePlaceError = ({ status, message }) => {
  if (status === 401) {
    Alert.error('Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldest bist.')
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(`Dein Eintrag konnte nicht gespeichert werden / ${message}`)
  }
}

export const savePlaceSuccess = ({ body }) => {
  Alert.success(`Dein Eintrag <strong>${body.name}</strong> wurde erfolgreich gespeichert.`)
  history.push(MAP);
}

export const updatePlaceSuccess = () => {
  Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
  history.push(MAP);
}

export const deletePlaceError = ({ message }) => {
  Alert.error(`Dein Eintrag konnte nicht gelöscht werden / ${message}`)
}
export const deletePlaceSuccess = () => {
  Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
  history.push(MY_ENTRIES);
}


export const initCreatePlace = () => ({
  type: INIT_CREATE_PLACE,
  payload: {
    place: {
      ownerships: [],
      image: null,
      url: '',
      type: '',
      name: '',
      city: '',
      description: '',
      maximum_members: 0,
      participation: '',
    },
  },
})
export const createDepot = depot => () => {
  request
    .post(`${config.apiBaseUrl}/depots`, mapDepotToApiParams(depot))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
}
export const createFarm = farm => () => {
  request.post(`${config.apiBaseUrl}/farms`, mapDepotToApiParams(farm))
    .then(savePlaceSuccess)
    .catch(savePlaceError)
}

export const initUpdateDepot = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/depots/${id}`)
    .then(result => dispatch(initEditPlaceSuccess(result.body)))
    .catch(initEditPlaceError)
}
export const updateDepot = depot => () => (
  request
    .put(`${config.apiBaseUrl}/depots/${depot.id}`, mapDepotToApiParams(depot))
    .then(updatePlaceSuccess)
    .catch(savePlaceError)
)

export const initUpdateFarm = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/farms/${id}`)
    .then(result => dispatch(initEditPlaceSuccess(result.body)))
    .catch(initEditPlaceError)
}
export const updateFarm = farm => () => (
  request
    .put(`${config.apiBaseUrl}/farms/${farm.id}`, mapFarmToApiParams(farm))
    .then(updatePlaceSuccess)
    .catch(savePlaceError)
)

export const initDeletePlace = id => (dispatch) => {
  request
    .get(`${config.apiBaseUrl}/places/${id}`)
    .then(result => dispatch(initEditPlaceSuccess(result.body)))
    .catch(initEditPlaceError)
}
export const deletePlace = id => () => {
  request
    .del(`${config.apiBaseUrl}/places/${id}`)
    .then(deletePlaceSuccess)
    .catch(deletePlaceError)
}

