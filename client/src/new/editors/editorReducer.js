import {
  INIT_CREATE_PLACE,
  INIT_EDIT_PLACE_SUCCESS,
  EDITING_COMPLETED,
} from './editorActions'

const initialState = {
  place: null,
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CREATE_PLACE:
    case INIT_EDIT_PLACE_SUCCESS:
      return {
        place: action.payload,
      }
    case EDITING_COMPLETED:
      return initialState
    default:
      return state
  }
}

export default entry
