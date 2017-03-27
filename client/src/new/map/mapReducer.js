import config, { countries } from '../configuration'
import {
  FETCH_ALL_PLACES_REQUESTED,
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  FETCH_PLACE_SUCCESS,
  SHOW_POSITION,
  SET_COUNTRY,
} from './mapActions'


const initialState = {
  places: [],
  isFetchingAll: false,
  position: {
    lat: 0,
    lon: 0,
  },
  zoom: 0,
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_REQUESTED:
      return {
        ...state,
        isFetchingAll: true,
      }

    case FETCH_ALL_PLACES_SUCCESS:
      return {
        ...state,
        places: action.payload,
        isFetchingAll: false,
      }

    case FETCH_ALL_PLACES_ERROR:
      return initialState

    case SHOW_POSITION:
      return {
        ...state,
        position: {
          lat: Number(action.payload.lat),
          lon: Number(action.payload.lon),
        },
        place: null,
        zoom: config.zoom.searchResult,
      }

    case SET_COUNTRY:
      return {
        ...state,
        country: action.payload,
        position: countries[action.payload].center,
        zoom: countries[action.payload].zoom,
      }

    case FETCH_PLACE_SUCCESS:
      return {
        ...state,
        position: {
          lat: Number(action.payload.latitude),
          lon: Number(action.payload.longitude),
        },
        zoom: config.zoom.searchResult,
      }

    default:
      return state
  }
}

export default map
