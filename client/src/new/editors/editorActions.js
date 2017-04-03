import Alert from 'react-s-alert';
import request from '../common/request'
import { history, MY_ENTRIES, MAP } from '../AppRouter'
import config from '../configuration'
import { requestAllPlaces } from '../map/mapActions'

export const INIT_CREATE_PLACE = 'INIT_CREATE_PLACE'
export const INIT_EDIT_PLACE_SUCCESS = 'INIT_EDIT_PLACE_SUCCESS'
export const CLEAR_EDITOR = 'CLEAR_EDITOR'

const mapDepotToApiParams = payload => ({
  ...payload,
  ...payload.geocoder,
  places: payload.places || null,
})

const mapFarmToApiParams = payload => ({
  ...payload,
  ...payload.geocoder,
})

const mapInitiativeToApiParams = payload => ({
  ...payload,
  ...payload.geocoder,
})

export const clearEditor = () => ({
  type: CLEAR_EDITOR,
})

export const closeEditorAndGoto = nextScreenUrl => (dispatch) => {
  dispatch(clearEditor());
  dispatch(requestAllPlaces(true))
  history.push(nextScreenUrl);
}

export const initEditPlaceError = payload => () => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}
export const initEditPlaceSuccess = place => ({
  type: INIT_EDIT_PLACE_SUCCESS,
  payload: place,
})

export const savePlaceError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error('Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldest bist.')
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(`Dein Eintrag konnte nicht gespeichert werden / ${message}`)
  }
}

export const createPlaceSuccess = place => (dispatch) => {
  Alert.success(`Dein Eintrag <strong>${place.name}</strong> wurde erfolgreich gespeichert.`)
  dispatch(closeEditorAndGoto(MAP))
}

export const updatePlaceSuccess = () => (dispatch) => {
  Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
  dispatch(closeEditorAndGoto(MAP))
}

export const deletePlaceError = ({ message }) => () => {
  Alert.error(`Dein Eintrag konnte nicht gelöscht werden / ${message}`)
}
export const deletePlaceSuccess = () => (dispatch) => {
  Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
  dispatch(closeEditorAndGoto(MY_ENTRIES))
}

export const initCreatePlace = () => (dispatch) => {
  dispatch(clearEditor())
  return ({
    type: INIT_CREATE_PLACE,
    payload: {},
  });
}

export const createDepot = depot => dispatch => request
  .post(`${config.apiBaseUrl}/depots`, mapDepotToApiParams(depot))
  .withCredentials()
  .then(res => dispatch(createPlaceSuccess(res.body)))
  .catch(res => dispatch(savePlaceError(res)))

export const createFarm = farm => dispatch => request
  .post(`${config.apiBaseUrl}/farms`, mapFarmToApiParams(farm))
  .withCredentials()
  .then(res => dispatch(createPlaceSuccess(res.body)))
  .catch(res => dispatch(savePlaceError(res)))

export const createInitiative = farm => dispatch => request
  .post(`${config.apiBaseUrl}/initiatives`, mapInitiativeToApiParams(farm))
  .withCredentials()
  .then(res => dispatch(createPlaceSuccess(res.body)))
  .catch(res => dispatch(savePlaceError(res)))

export const initUpdateDepot = id => (dispatch) => {
  dispatch(clearEditor())
  return request
    .get(`${config.apiBaseUrl}/depots/${id}`)
    .withCredentials()
    .then(res => dispatch(initEditPlaceSuccess(res.body)))
    .catch(res => dispatch(initEditPlaceError(res)));
}

export const updateDepot = depot => dispatch => request
  .put(`${config.apiBaseUrl}/depots/${depot.id}`, mapDepotToApiParams(depot))
  .withCredentials()
  .then(() => dispatch(updatePlaceSuccess(depot)))
  .catch(res => dispatch(savePlaceError(res)))

export const initUpdateFarm = id => (dispatch) => {
  dispatch(clearEditor())
  return request
    .get(`${config.apiBaseUrl}/farms/${id}`)
    .withCredentials()
    .then(res => dispatch(initEditPlaceSuccess(res.body)))
    .catch(res => dispatch(initEditPlaceError(res)));
}

export const updateFarm = farm => dispatch => request
  .put(`${config.apiBaseUrl}/farms/${farm.id}`, mapFarmToApiParams(farm))
  .withCredentials()
  .then(() => dispatch(updatePlaceSuccess(farm)))
  .catch(res => dispatch(savePlaceError(res)))

export const initUpdateInitiative = id => (dispatch) => {
  dispatch(clearEditor())
  return request
    .get(`${config.apiBaseUrl}/initiatives/${id}`)
    .withCredentials()
    .then(res => dispatch(initEditPlaceSuccess(res.body)))
    .catch(res => dispatch(initEditPlaceError(res)));
}

export const updateInitiative = farm => dispatch => request
  .put(`${config.apiBaseUrl}/initiatives/${farm.id}`, mapInitiativeToApiParams(farm))
  .withCredentials()
  .then(() => dispatch(updatePlaceSuccess(farm)))
  .catch(res => dispatch(savePlaceError(res)))

export const initDeletePlace = id => (dispatch) => {
  dispatch(clearEditor())
  request
    .get(`${config.apiBaseUrl}/places/${id}`)
    .withCredentials()
    .then(res => dispatch(initEditPlaceSuccess(res.body)))
    .catch(res => dispatch(initEditPlaceError(res)))
}

export const deletePlace = id => dispatch => request
  .del(`${config.apiBaseUrl}/places/${id}`)
  .withCredentials()
  .then(() => dispatch(deletePlaceSuccess({ id })))
  .catch(res => dispatch(deletePlaceError(res)))

