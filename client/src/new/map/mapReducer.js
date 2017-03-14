import { config } from '../App';
import {
  FETCH_ALL_PLACES_REQUESTED,
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  SHOW_POSITION,
  SHOW_HIGHLIGHT,
} from './mapActions'

const initialState = { places: [] }

const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_REQUESTED:
      return {
        ...state,
        isFetching: true,
      }

    case FETCH_ALL_PLACES_SUCCESS:
      return {
        ...state,
        places: action.payload,
        isFetching: false,
      }

    case FETCH_ALL_PLACES_ERROR:
      return initialState

    case SHOW_POSITION:
      return {
        ...state,
        position: action.payload,
        zoom: config.zoom.searchResult,
      }

    case SHOW_HIGHLIGHT:
      return {
        ...state,
        highlight: action.payload,
      }

    default:
      return state
  }
}

export default map
