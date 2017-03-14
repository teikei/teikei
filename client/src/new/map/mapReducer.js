import { config } from '../App';
import {
  FETCH_ALL_PLACES_SUCCESS,
  FETCH_ALL_PLACES_ERROR,
  SHOW_POSITION,
} from './mapActions'

const initialState = { places: [] }

const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_SUCCESS:
      return { places: action.payload }
    case FETCH_ALL_PLACES_ERROR:
      return initialState
    case SHOW_POSITION:
      return {
        ...state,
        position: action.payload,
        zoom: config.zoom.searchResult,
      }
    default:
      return state
  }
}

export default map
