import { INIT_SHOW_PLACE_SUCCESS, HIDE_PLACE } from './detailsActions';

const initialState = {
  place: null,
}

const map = (state = initialState, action) => {
  switch (action.type) {

    case INIT_SHOW_PLACE_SUCCESS:
      return {
        place: action.payload,
      }

    case HIDE_PLACE:
      return initialState

    default:
      return state
  }
}

export default map
