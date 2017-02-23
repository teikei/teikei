import {
  INIT_CREATE_DEPOT_EDITOR,
  INIT_CREATE_FARM_EDITOR,
  FETCH_PLACE_FOR_EDITING_SUCCESS,
} from './editorActions'


export const EMPTY_PLACE = {
  ownerships: [],
  image: null,
  url: '',
  type: '',
  name: '',
  city: '',
  description: '',
  maximum_members: 0,
  participation: '',
}

const initialState = {
  currentPlace: null,
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CREATE_DEPOT_EDITOR:
    case INIT_CREATE_FARM_EDITOR:
      return {
        currentPlace: EMPTY_PLACE,
      }
    case FETCH_PLACE_FOR_EDITING_SUCCESS:
      return {
        currentPlace: action.payload.place,
      }
    default:
      return state
  }
}

export default entry
