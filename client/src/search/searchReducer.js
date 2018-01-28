import {
  AUTOCOMPLETE_SEARCH,
  AUTOCOMPLETE_SEARCH_SUCCESS,
  SHOW_GEOCODE_POSITION_SUCCESS,
  AUTOCOMPLETE_UPDATE_VALUE
} from './searchActions'
import { SET_COUNTRY } from '../map/mapActions'

const initialState = { items: [], value: '', loading: false }

const search = (state = initialState, action) => {
  switch (action.type) {
    case AUTOCOMPLETE_SEARCH:
      return { ...state, loading: true }

    case AUTOCOMPLETE_UPDATE_VALUE:
      return { ...state, value: action.payload }

    case AUTOCOMPLETE_SEARCH_SUCCESS:
      return { ...state, items: action.payload, loading: false }

    case SHOW_GEOCODE_POSITION_SUCCESS:
      return {
        ...state,
        geocodePosition: {
          lon: action.payload.lon,
          lat: action.payload.lat
        }
      }

    case SET_COUNTRY:
      return initialState

    default:
      return state
  }
}

export default search
