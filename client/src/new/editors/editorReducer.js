import {
  NEW_DEPOT,
  NEW_FARM,
  FETCH_PLACE_FOR_EDITING_SUCCESS,
} from './editorActions'


const EMPTY_PLACE = {
  ownerships: [],
  image: null,
  url: '',
  type: '',
  name: 'Loading...',
  city: '',
  description: '',
  maximum_members: 0,
  participation: '',
}

const initialState = {
  currentPlace: null,
  isEditing: false,
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case NEW_DEPOT:
    case NEW_FARM:
      return {
        currentPlace: EMPTY_PLACE,
        isEditing: true,
      }
    case FETCH_PLACE_FOR_EDITING_SUCCESS:
      return {
        currentPlace: action.payload.place,
        isEditing: true,
      }
    default:
      return state
  }
}

export default entry
