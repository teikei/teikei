/*  __
___( o)>
\ <_. )
 `---'
*/
import Alert from 'react-s-alert'
import { client } from '../../App'
import config, { countries } from '../../configuration'
import { INIT_SHOW_PLACE_SUCCESS } from '../Details/duck'

export const FETCH_ALL_PLACES_REQUESTED = 'FETCH_ALL_PLACES_REQUESTED'
export const FETCH_ALL_PLACES_SUCCESS = 'FETCH_ALL_PLACES_SUCCESS'
export const FETCH_ALL_PLACES_ERROR = 'FETCH_ALL_PLACES_ERROR'
export const FETCH_MY_ENTRIES_SUCCESS = 'FETCH_MY_ENTRIES_SUCCESS'
export const FETCH_MY_ENTRIES_ERROR = 'FETCH_MY_ENTRIES_ERROR'
export const SHOW_POSITION = 'SHOW_POSITION'
export const SET_COUNTRY = 'SET_COUNTRY'
export const SHOW_INFO = 'SHOW_INFO'
export const SHOW_MAP = 'SHOW_MAP'

const initialState = {
  places: [],
  data: undefined,
  myentries: { features: [] },
  isFetchingAll: false,
  position: {
    lat: 0,
    lon: 0
  },
  previousZoom: config.zoom.default,
  zoom: config.zoom.default,
  showInfo: false
}

export const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_REQUESTED:
      return {
        ...state,
        isFetchingAll: true
      }

    case FETCH_ALL_PLACES_SUCCESS:
      return {
        ...state,
        features: action.payload ? action.payload : state.places,
        data: action.payload ? action.payload : state.data,
        isFetchingAll: false
      }

    case FETCH_ALL_PLACES_ERROR:
      return initialState

    case FETCH_MY_ENTRIES_SUCCESS:
      return {
        ...state,
        myentries: action.payload ? action.payload : state.myentries
      }

    case FETCH_MY_ENTRIES_ERROR:
      return initialState

    case SHOW_POSITION:
      return {
        ...state,
        position: {
          lat: action.payload.latitude,
          lon: action.payload.longitude
        },
        zoom: config.zoom.searchResult,
        previousZoom: state.zoom
      }

    case INIT_SHOW_PLACE_SUCCESS:
      return {
        ...state,
        position: {
          lat: Number(action.payload.geometry.coordinates[1]),
          lon: Number(action.payload.geometry.coordinates[0]) - 0.04
        },
        zoom: config.zoom.searchResult,
        previousZoom: state.zoom
      }

    case SET_COUNTRY:
      return {
        ...state,
        country: action.payload,
        position: countries[action.payload].center,
        zoom: countries[action.payload].zoom
      }

    case SHOW_INFO:
      return {
        ...state,
        showInfo: true
      }

    case SHOW_MAP:
      return {
        ...state,
        showInfo: false,
        zoom: state.previousZoom
      }

    default:
      return state
  }
}

const shouldFetchData = ({ isFetchingAll, places }) =>
  !isFetchingAll || places.length < 1

export const showPosition = payload => ({ type: SHOW_POSITION, payload })

const fetchAllPlacesRequested = () => ({ type: FETCH_ALL_PLACES_REQUESTED })

const fetchAllPlacesSuccess = payload => ({
  type: FETCH_ALL_PLACES_SUCCESS,
  payload
})

const fetchMyEntriesSuccess = payload => ({
  type: FETCH_MY_ENTRIES_SUCCESS,
  payload
})

const fetchAllPlacesError = payload => {
  Alert.error('Die Karte konnte nicht geladen werden.')
  return { type: FETCH_ALL_PLACES_ERROR, payload, error: true }
}

const fetchMyEntriesError = payload => {
  Alert.error('Die Einträge konnten nicht geladen werden.')
  return { type: FETCH_MY_ENTRIES_ERROR, payload, error: true }
}

const fetchAllPlaces = () => dispatch =>
  client
    .service('entries')
    .find()
    .then(res => dispatch(fetchAllPlacesSuccess(res)))
    .catch(e => dispatch(fetchAllPlacesError(e)))

export const fetchMyEntries =  () => dispatch => {
  return client
    .service('entries')
    .find({ query: { mine: true } })
    .then(res => dispatch(fetchMyEntriesSuccess(res)))
    .catch(e => dispatch(fetchMyEntriesError(e)))
}

export const requestAllPlaces = force => (dispatch, getState) => {
  dispatch(fetchAllPlacesRequested())

  if (force || shouldFetchData(getState().map)) {
    return dispatch(fetchAllPlaces())
  }
  return dispatch(fetchAllPlacesSuccess())
}

export const setCountry = country => ({ type: SET_COUNTRY, payload: country })

export const showInfo = () => ({ type: SHOW_INFO })

export const showMap = () => ({ type: SHOW_MAP })
