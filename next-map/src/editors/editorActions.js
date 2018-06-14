import Alert from 'react-s-alert'
import { SubmissionError } from 'redux-form'
import _ from 'lodash'
import request, { formSubmitter } from '../common/request'
import { history, MY_ENTRIES, MAP } from '../AppRouter'
import config from '../configuration'
import { requestAllPlaces } from '../map/mapActions'
import { client } from '../App'

export const INIT_CREATE_PLACE = 'INIT_CREATE_PLACE'
export const INIT_EDIT_PLACE_SUCCESS = 'INIT_EDIT_PLACE_SUCCESS'
export const CLEAR_EDITOR = 'CLEAR_EDITOR'

const mapDepotToApiParams = payload => ({
  ..._.omit(payload, 'geocoder'),
  ...payload.geocoder,
  places: payload.places ? payload.places.map(p => p.id) : []
})

const mapFarmToApiParams = payload => ({
  ..._.omit(
    payload,
    'geocoder',
    'animal_products',
    'vegetable_products',
    'beverages'
  ),
  products: _.compact([
    payload.animal_products,
    payload.vegetable_products,
    payload.beverages
  ]).reduce((prev, cur) => prev.concat(cur), []),
  ...payload.geocoder
})

const mapInitiativeToApiParams = payload => ({
  ..._.omit(payload, 'geocoder'),
  ...payload.geocoder
})

export const clearEditor = () => ({
  type: CLEAR_EDITOR
})

export const closeEditorAndGoto = nextScreenUrl => dispatch => {
  dispatch(clearEditor())
  dispatch(requestAllPlaces(true))
  history.push(nextScreenUrl)
}

export const initEditPlaceError = payload => () => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}
export const initEditPlaceSuccess = place => ({
  type: INIT_EDIT_PLACE_SUCCESS,
  payload: place
})

export const savePlaceError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error(
      'Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldet bist.'
    )
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(`Dein Eintrag konnte nicht gespeichert werden / ${message}`)
  }
}

export const createPlaceSuccess = place => dispatch => {
  Alert.success(
    `Dein Eintrag <strong>${place.name}</strong> wurde erfolgreich gespeichert.`
  )
  dispatch(closeEditorAndGoto(MAP))
}

export const updatePlaceSuccess = () => dispatch => {
  Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
  dispatch(closeEditorAndGoto(MAP))
}

export const deletePlaceError = ({ message }) => () => {
  Alert.error(`Dein Eintrag konnte nicht gelöscht werden / ${message}`)
}
export const deletePlaceSuccess = () => dispatch => {
  Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
  dispatch(closeEditorAndGoto(MY_ENTRIES))
}

export const initCreatePlace = () => dispatch => {
  dispatch(clearEditor())
  return {
    type: INIT_CREATE_PLACE,
    payload: {}
  }
}

export const createDepot = depot => dispatch =>
  // formSubmitter(
  //   request.post(`${config.apiBaseUrl}/depots`, mapDepotToApiParams(depot)),
  //   response => dispatch(createPlaceSuccess(response)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('depots')
    .create(mapDepotToApiParams(depot))
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const createFarm = farm => dispatch =>
  // formSubmitter(
  //   request.post(`${config.apiBaseUrl}/farms`, mapFarmToApiParams(farm)),
  //   response => dispatch(createPlaceSuccess(response)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('farms')
    .create(mapFarmToApiParams(farm))
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const createInitiative = farm => dispatch =>
  // formSubmitter(
  //   request.post(
  //     `${config.apiBaseUrl}/initiatives`,
  //     mapInitiativeToApiParams(farm)
  //   ),
  //   response => dispatch(createPlaceSuccess(response)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('initiatives')
    .create(mapInitiativeToApiParams(farm))
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initUpdateDepot = id => dispatch => {
  dispatch(clearEditor())
  // return request
  //   .get(`${config.apiBaseUrl}/depots/${id}`)
  //   .then(res => dispatch(initEditPlaceSuccess(res.body)))
  //   .catch(res => dispatch(initEditPlaceError(res)))
  client
    .service('depots')
    .get(id)
    .then(response => dispatch(initEditPlaceSuccess(response)))
    .catch(response => {
      dispatch(initEditPlaceError(response))
      throw new SubmissionError(response)
    })
}

export const updateDepot = depot => dispatch =>
  // formSubmitter(
  //   request.put(
  //     `${config.apiBaseUrl}/depots/${depot.id}`,
  //     mapDepotToApiParams(depot)
  //   ),
  //   () => dispatch(updatePlaceSuccess(depot)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('depots')
    .patch(depot.id, mapDepotToApiParams(depot))
    .then(response => dispatch(updatePlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initUpdateFarm = id => dispatch => {
  dispatch(clearEditor())
  // return request
  //   .get(`${config.apiBaseUrl}/farms/${id}`)
  //   .withCredentials()
  //   .then(res => dispatch(initEditPlaceSuccess(res.body)))
  //   .catch(res => dispatch(initEditPlaceError(res)))
  client
    .service('farms')
    .get(id)
    .then(response => dispatch(initEditPlaceSuccess(response)))
    .catch(response => {
      dispatch(initEditPlaceError(response))
      throw new SubmissionError(response)
    })
}

export const updateFarm = farm => dispatch =>
  // formSubmitter(
  //   request.put(
  //     `${config.apiBaseUrl}/farms/${farm.id}`,
  //     mapFarmToApiParams(farm)
  //   ),
  //   () => dispatch(updatePlaceSuccess(farm)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('farms')
    .patch(farm.id, mapFarmToApiParams(farm))
    .then(response => dispatch(updatePlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initUpdateInitiative = id => dispatch => {
  dispatch(clearEditor())
  // return request
  //   .get(`${config.apiBaseUrl}/initiatives/${id}`)
  //   .withCredentials()
  //   .then(res => dispatch(initEditPlaceSuccess(res.body)))
  //   .catch(res => dispatch(initEditPlaceError(res)))
  client
    .service('initiatives')
    .get(id)
    .then(response => dispatch(initEditPlaceSuccess(response)))
    .catch(response => {
      dispatch(initEditPlaceError(response))
      throw new SubmissionError(response)
    })
}

export const updateInitiative = initiative => dispatch =>
  // formSubmitter(
  //   request.put(
  //     `${config.apiBaseUrl}/initiatives/${farm.id}`,
  //     mapInitiativeToApiParams(farm)
  //   ),
  //   () => dispatch(updatePlaceSuccess(farm)),
  //   response => dispatch(savePlaceError(response))
  // )
  client
    .service('initiatives')
    .patch(initiative.id, mapInitiativeToApiParams(initiative))
    .then(response => dispatch(updatePlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initDeletePlace = ({ id, service }) => dispatch => {
  dispatch(clearEditor())
  // request
  //   .get(`${config.apiBaseUrl}/places/${id}`)
  //   .withCredentials()
  //   .then(res => dispatch(initEditPlaceSuccess(res.body)))
  //   .catch(res => dispatch(initEditPlaceError(res)))
  client
    .service(service)
    .get(id)
    .then(response => dispatch(initEditPlaceSuccess(response)))
    .catch(response => {
      dispatch(initEditPlaceError(response))
      throw new SubmissionError(response)
    })
}

// TODO need to distinguish by type for new API
export const deletePlace = place => dispatch => {
  // return request
  //   .del(`${config.apiBaseUrl}/places/${place.id}`)
  //   .withCredentials()
  //   .then(() => dispatch(deletePlaceSuccess({ id: place.id })))
  //   .catch(res => dispatch(deletePlaceError(res)))
  client
    .service(`${place.type}s`)
    .remove(place.id)
    .then(response => dispatch(deletePlaceSuccess(response)))
    .catch(response => {
      dispatch(deletePlaceError(response))
      throw new SubmissionError(response)
    })
}
