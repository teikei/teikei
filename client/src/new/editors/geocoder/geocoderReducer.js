import {
  GEOCODE_SUCCESS,
  GEOCODE_ERROR,
} from './geocoderActions'

const initialState = {
  latitude: null,
  longitude: null,
}

const geocoder = (state = initialState, action) => {
  switch (action.type) {
    case GEOCODE_SUCCESS:
      return action.payload
    case GEOCODE_ERROR:
      return initialState
    default:
      return state
  }
}

export default geocoder
