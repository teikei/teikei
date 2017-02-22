import {
  ENTRY_NEW_DEPOT,
  ENTRY_NEW_FARM,
  ENTRY_EDIT_DEPOT,
  ENTRY_EDIT_FARM,
  ENTRY_DELETE_DEPOT,
  ENTRY_DELETE_FARM,
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
  step: 0,
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case ENTRY_NEW_DEPOT:
    case ENTRY_NEW_FARM:
      return {
        currentPlace: EMPTY_PLACE,
        isEditing: true,
        step: 1,
      }
    case ENTRY_EDIT_DEPOT:
    case ENTRY_EDIT_FARM:
    case ENTRY_DELETE_DEPOT:
    case ENTRY_DELETE_FARM:
    default:
      return state
  }
}

export default entry
