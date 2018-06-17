import {
  AUTOCOMPLETE_SEARCH,
  SHOW_GEOCODE_POSITION_SUCCESS,
  AUTOCOMPLETE_SEARCH_SUCCESS
} from './searchActions'
import { SET_COUNTRY } from '../map/mapActions'

const initialState = { items: [], value: '', loading: false }

const search = (state = initialState, action) => {
  switch (action.type) {
    case AUTOCOMPLETE_SEARCH:
      return { ...state, loading: true }

    case AUTOCOMPLETE_SEARCH_SUCCESS:
      return {
        ...state,
        items: action.payload && action.payload.map(l => ({ key: l.id, ...l })),
        loading: false
      }

    case SHOW_GEOCODE_POSITION_SUCCESS:
      return { ...state, geocodePosition: action.payload }

    case SET_COUNTRY:
      return initialState

    default:
      return state
  }
}

export default search
