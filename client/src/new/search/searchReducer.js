import {
  AUTOCOMPLETE_SEARCH,
  AUTOCOMPLETE_SEARCH_ERROR,
  AUTOCOMPLETE_SEARCH_SUCCESS,
  AUTOCOMPLETE_UPDATE_VALUE,
} from './searchActions'

const initialState = { items: [], value: '', loading: false }

const search = (state = initialState, action) => {
  switch (action.type) {
    case AUTOCOMPLETE_SEARCH:
      return {
        ...state,
        loading: true,
      }

    case AUTOCOMPLETE_UPDATE_VALUE:
      return {
        ...state,
        value: action.payload,
      }

    case AUTOCOMPLETE_SEARCH_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
      }

    case AUTOCOMPLETE_SEARCH_ERROR:
      return initialState

    default:
      return state
  }
}

export default search
