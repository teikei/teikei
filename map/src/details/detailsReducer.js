import { INIT_SHOW_PLACE_SUCCESS, HIDE_PLACE } from './detailsActions'
import featureToPlace from '../common/migrationUtils'

const initialState = {
  place: null
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case INIT_SHOW_PLACE_SUCCESS:
      return {
        place: featureToPlace(action.payload)
      }

    case HIDE_PLACE:
      return initialState

    default:
      return state
  }
}

export default map
