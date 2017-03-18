import config from '../configuration'
import {
  FETCH_ALL_PLACES_REQUESTED,
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  FETCH_PLACE_SUCCESS,
  SHOW_POSITION,
} from './mapActions'

const initialState = { places: [] }

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
        position: action.payload,
        place: null,
        zoom: config.zoom.searchResult,
      }

    case FETCH_PLACE_SUCCESS:
      return {
        ...state,
        position: [Number(action.payload.latitude), Number(action.payload.longitude)],
        place: action.payload,
        zoom: null,
      }

    default:
      return state
  }
}

export default map
