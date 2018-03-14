import config, { countries } from '../configuration'
import {
  FETCH_ALL_PLACES_REQUESTED,
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  SHOW_POSITION,
  SET_COUNTRY,
  SHOW_INFO,
  SHOW_MAP
} from './mapActions'

const initialState = {
  places: [],
  isFetchingAll: false,
  position: {
    lat: 0,
    lon: 0
  },
  zoom: 0,
  showInfo: false
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_REQUESTED:
      return {
        ...state,
        isFetchingAll: true
      }

    case FETCH_ALL_PLACES_SUCCESS:
      return {
        ...state,
        places: action.payload ? action.payload : state.places,
        isFetchingAll: false
      }

    case FETCH_ALL_PLACES_ERROR:
      return initialState

    case SHOW_POSITION:
      return {
        ...state,
        position: {
          lat: Number(action.payload.lat),
          lon: Number(action.payload.lon)
        },
        zoom: config.zoom.searchResult
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
        showInfo: false
      }

    default:
      return state
  }
}

export default map
