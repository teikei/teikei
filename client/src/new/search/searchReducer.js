import {
  AUTOCOMPLETE_SEARCH,
  AUTOCOMPLETE_SEARCH_ERROR,
  AUTOCOMPLETE_SEARCH_SUCCESS,
  SELECT_SEARCH_RESULT,
} from './searchActions'

const initialState = { items: [], value: '', loading: false }

const search = (state = initialState, action) => {
  switch (action.type) {
    case AUTOCOMPLETE_SEARCH:
      return {
        ...state,
        loading: true,
      }

    case AUTOCOMPLETE_SEARCH_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
      }

    case AUTOCOMPLETE_SEARCH_ERROR:
      return initialState

    case SELECT_SEARCH_RESULT:
      return {
        ...state,
      }

    default:
      return state
  }
}

export default search
