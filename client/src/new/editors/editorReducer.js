import {
  INIT_CREATE_PLACE,
  INIT_UPDATE_PLACE_SUCCESS,
} from './editorActions'

const initialState = {
  place: null,
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CREATE_PLACE:
      return {
        place: action.payload.place,
        editMode: 'create',
      }
    case INIT_UPDATE_PLACE_SUCCESS:
      return {
        place: action.payload.place,
        editMode: 'update',
      }
    default:
      return state
  }
}

export default entry
