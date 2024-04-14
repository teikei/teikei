/*  __
___( o)>
\ <_. )
 `---'
*/
import Alert from 'react-s-alert'
import { SubmissionError } from 'redux-form'

import { history, MAP, MY_ENTRIES } from '../../AppRouter'
import { requestAllPlaces } from '../Map/duck'
import { client } from '../../main'
import { transformErrorResponse } from '../../common/formUtils'

export const INIT_CREATE_PLACE = 'INIT_CREATE_PLACE'
export const INIT_EDIT_PLACE_SUCCESS = 'INIT_EDIT_PLACE_SUCCESS'
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS'
export const FETCH_GOALS_SUCCESS = 'FETCH_GOALS_SUCCESS'
export const FETCH_BADGES_SUCCESS = 'FETCH_BADGES_SUCCESS'

const initialState = {
  feature: null,
  products: [],
  goals: [],
}

export const editor = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CREATE_PLACE:
    case INIT_EDIT_PLACE_SUCCESS:
      return Object.assign({}, state, {
        feature: action.payload,
      })
    case FETCH_PRODUCTS_SUCCESS:
      return Object.assign({}, state, {
        products: action.payload,
      })
    case FETCH_GOALS_SUCCESS:
      return Object.assign({}, state, {
        goals: action.payload,
      })
    case FETCH_BADGES_SUCCESS:
      return Object.assign({}, state, {
        badges: action.payload,
      })
    default:
      return state
  }
}

export const mapDepotToApiParams = (payload) => ({
  ...payload,
  farms: payload.farms ? payload.farms.map((p) => p.id) : [],
})

export const closeEditorAndGoto = (nextScreenUrl) => (dispatch) => {
  dispatch(requestAllPlaces(true))
  history.push(nextScreenUrl)
}

export const savePlaceError =
  ({ status, message }) =>
  () => {
    if (status === 401) {
      Alert.error(
        'Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldet bist.',
      )
    } else if (status === 422) {
      Alert.error('Bitte überprüfe deine Eingaben.')
    } else {
      Alert.error(`Dein Eintrag konnte nicht gespeichert werden / ${message}`)
    }
  }

export const createPlaceSuccess =
  ({ properties: { name } }) =>
  (dispatch) => {
    Alert.success(
      `Dein Eintrag <strong>${name}</strong> wurde erfolgreich gespeichert.`,
    )
    dispatch(closeEditorAndGoto(MAP))
  }

export const updatePlaceSuccess = () => (dispatch) => {
  Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
  dispatch(closeEditorAndGoto(MAP))
}

export const initCreatePlace = () => ({
  type: INIT_CREATE_PLACE,
  payload: {},
})

export const initCreateFeature = () => (dispatch) => {
  dispatch(initCreatePlace())
}

export const createDepot = (depot) => (dispatch) =>
  client
    .service('depots')
    .create(mapDepotToApiParams(depot))
    .then((response) => dispatch(createPlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const createFarm = (farm) => (dispatch) =>
  client
    .service('farms')
    .create(farm)
    .then((response) => dispatch(createPlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const createInitiative = (initiative) => (dispatch) =>
  client
    .service('initiatives')
    .create(initiative)
    .then((response) => dispatch(createPlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const initEditFeatureError = (payload) => () => {
  Alert.error(`Der Eintrag konnte nicht geladen werden / ${payload.message}`)
}

export const initEditFeatureSuccess = (place) => ({
  type: INIT_EDIT_PLACE_SUCCESS,
  payload: place,
})

export const initEditFeature = (id, type) => async (dispatch) => {
  const ownershipCheck = await client
    .service('entries')
    .find({ query: { mine: true, type, id } })
  if (ownershipCheck.features.length !== 1) {
    window.location.assign(MAP)
    dispatch(initEditFeatureError({ message: 'Unauthorized' }))
  }
  client
    .service(`${type.toLowerCase()}s`)
    .get(id)
    .then((response) => dispatch(initEditFeatureSuccess(response)))
    .catch((response) => {
      dispatch(initEditFeatureError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })
}

export const updateDepot = (depot) => (dispatch) =>
  client
    .service('depots')
    .patch(depot.id, mapDepotToApiParams(depot))
    .then((response) => dispatch(updatePlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const updateFarm = (farm) => (dispatch) =>
  client
    .service('farms')
    .patch(farm.id, farm)
    .then((response) => dispatch(updatePlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const updateInitiative = (initiative) => (dispatch) =>
  client
    .service('initiatives')
    .patch(initiative.id, initiative)
    .then((response) => dispatch(updatePlaceSuccess(response)))
    .catch((response) => {
      dispatch(savePlaceError(response))
      throw new SubmissionError(transformErrorResponse(response))
    })

export const initDeleteFeature =
  ({ id, service }) =>
  (dispatch) => {
    client
      .service(service)
      .get(id)
      .then((response) => dispatch(initEditFeatureSuccess(response)))
      .catch((response) => {
        dispatch(initEditFeatureError(response))
      })
  }

export const deleteFeatureError =
  ({ message }) =>
  () => {
    Alert.error(`Dein Eintrag konnte nicht gelöscht werden / ${message}`)
  }

export const deleteFeatureSuccess = () => (dispatch) => {
  Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
  dispatch(closeEditorAndGoto(MY_ENTRIES))
}

export const deleteFeature =
  ({ properties: { id, type } }) =>
  (dispatch) => {
    client
      .service(`${type.toLowerCase()}s`)
      .remove(id)
      .then((response) => dispatch(deleteFeatureSuccess(response)))
      .catch((response) => {
        dispatch(deleteFeatureError(response))
      })
  }

export const fetchProductsError = (payload) => () => {
  Alert.error(`Die Produkte konnten nicht geladen werden./ ${payload.message}`)
}
export const fetchProductsSuccess = (payload) => ({
  type: FETCH_PRODUCTS_SUCCESS,
  payload,
})

export const fetchProducts = () => (dispatch) => {
  client
    .service('products')
    .find()
    .then((response) => dispatch(fetchProductsSuccess(response)))
    .catch((response) => {
      dispatch(fetchProductsError(response))
    })
}

export const fetchGoalsError = (payload) => () => {
  Alert.error(`Die Ziele konnten nicht geladen werden./ ${payload.message}`)
}
export const fetchGoalsSuccess = (payload) => ({
  type: FETCH_GOALS_SUCCESS,
  payload,
})

export const fetchGoals = () => (dispatch) => {
  client
    .service('goals')
    .find()
    .then((response) => dispatch(fetchGoalsSuccess(response)))
    .catch((response) => {
      dispatch(fetchGoalsError(response))
    })
}

export const fetchBadgesError = (payload) => () => {
  Alert.error(
    `Die Mitgliedschaften und Zertifizierungen konnten nicht geladen werden./ ${payload.message}`,
  )
}
export const fetchBadgesSuccess = (payload) => ({
  type: FETCH_BADGES_SUCCESS,
  payload,
})

export const fetchBadges = () => (dispatch) => {
  client
    .service('badges')
    .find()
    .then((response) => dispatch(fetchBadgesSuccess(response)))
    .catch((response) => {
      dispatch(fetchBadgesError(response))
    })
}
