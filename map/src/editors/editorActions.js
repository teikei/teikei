import Alert from 'react-s-alert'
import { SubmissionError } from 'redux-form'
import _ from 'lodash'
import { history, MY_ENTRIES, MAP } from '../AppRouter'
import { requestAllPlaces } from '../map/mapActions'
import { client } from '../App'

export const INIT_CREATE_PLACE = 'INIT_CREATE_PLACE'
export const INIT_EDIT_PLACE_SUCCESS = 'INIT_EDIT_PLACE_SUCCESS'
export const CLEAR_EDITOR = 'CLEAR_EDITOR'

const mapDepotToApiParams = payload => {
  debugger
  return ({
    ...payload,
    farms: payload.farms ? payload.farms.map(p => p.id) : []
  })
}

const mapFarmToApiParams = payload => ({
  ..._.omit(payload, 'animalProducts', 'vegetableProducts', 'beverages'),
  products: _.compact([
    payload.animalProducts,
    payload.vegetableProducts,
    payload.beverages
  ]).reduce((prev, cur) => prev.concat(cur), [])
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
    `Dein Eintrag <strong>${
      place.name
    }</strong> wurde erfolgreich gespeichert.`
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
  client
    .service('depots')
    .create(mapDepotToApiParams(depot))
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const createFarm = farm => dispatch =>
  client
    .service('farms')
    .create(mapFarmToApiParams(farm))
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const createInitiative = initiative => dispatch =>
  client
    .service('initiatives')
    .create(initiative)
    .then(response => dispatch(createPlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initUpdateDepot = id => dispatch => {
  dispatch(clearEditor())
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
  client
    .service('initiatives')
    .patch(initiative.id, initiative)
    .then(response => dispatch(updatePlaceSuccess(response)))
    .catch(response => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(response)
    })

export const initDeletePlace = ({ id, service }) => dispatch => {
  dispatch(clearEditor())
  client
    .service(service)
    .get(id)
    .then(response => dispatch(initEditPlaceSuccess(response)))
    .catch(response => {
      dispatch(initEditPlaceError(response))
      throw new SubmissionError(response)
    })
}

export const deletePlace = place => dispatch => {
  client
    .service(`${place.type}s`)
    .remove(place.id)
    .then(response => dispatch(deletePlaceSuccess(response)))
    .catch(response => {
      dispatch(deletePlaceError(response))
      throw new SubmissionError(response)
    })
}
