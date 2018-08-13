import { INIT_SHOW_PLACE_SUCCESS, HIDE_PLACE } from './detailsActions'

const initialState = {
  feature: null
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case INIT_SHOW_PLACE_SUCCESS:
      return {
        feature: action.payload
      }

    case HIDE_PLACE:
      return initialState

    default:
      return state
  }
}

export default map
