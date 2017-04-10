import { INIT_SHOW_PLACE_SUCCESS } from './detailsActions';
import { SHOW_POSITION } from '../map/mapActions';


const initialState = {
  place: null,
}

const map = (state = initialState, action) => {
  switch (action.type) {

    case INIT_SHOW_PLACE_SUCCESS:
      return {
        place: action.payload,
      }

    case SHOW_POSITION:
      return initialState

    default:
      return state
  }
}

export default map
