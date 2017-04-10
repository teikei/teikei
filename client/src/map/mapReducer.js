import config, { countries } from '../configuration'
import {
  FETCH_ALL_PLACES_REQUESTED,
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  SHOW_POSITION,
  SET_COUNTRY,
  ADD_PLACE,
  UPDATE_PLACE,
  DELETE_PLACE,
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
        places: action.payload ? action.payload : state.places,
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
        zoom: config.zoom.searchResult,
      }

    case ADD_PLACE:
      return {
        ...state,
        places: [...state.places, action.payload],
      }

    case UPDATE_PLACE:
      return {
        ...state,
        places: state.places.map((p) => {
          if (p.id === action.payload.id) {
            return action.payload
          }
          return p
        }),
      }

    case DELETE_PLACE:
      return {
        ...state,
        places: state.places.filter(p => p.id !== action.payload.id),
      }
    case SET_COUNTRY:
      return {
        ...state,
        country: action.payload,
        position: countries[action.payload].center,
        zoom: countries[action.payload].zoom,
      }

    default:
      return state
  }
}

export default map
