import { FETCH_ALL_PLACES_SUCCESS, FETCH_ALL_PLACES_ERROR } from './mapActions'

const initialState = { places: [] }

const map = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_PLACES_SUCCESS:
      return { places: action.payload }
    case FETCH_ALL_PLACES_ERROR:
      return initialState
    default:
      return state
  }
}

export default map
