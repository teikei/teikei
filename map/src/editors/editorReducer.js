import {
  INIT_CREATE_PLACE,
  INIT_EDIT_PLACE_SUCCESS,
  CLEAR_EDITOR,
  FETCH_PRODUCTS_SUCCESS
} from './editorActions'

const initialState = {
  feature: null,
  products: []
}

const entry = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CREATE_PLACE:
    case INIT_EDIT_PLACE_SUCCESS:
      return Object.assign(state, {
        feature: action.payload
      })
    case FETCH_PRODUCTS_SUCCESS:
      return Object.assign(state, {
        products: action.payload
      })
    case CLEAR_EDITOR:
      return initialState
    default:
      return state
  }
}

export default entry
