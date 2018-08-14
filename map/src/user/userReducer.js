import {
  USER_SIGN_IN_SUCCESS,
  USER_SIGN_OUT_SUCCESS,
  USER_AUTHENTICATE_SUCCESS,
  USER_AUTHENTICATE_ERROR
} from './userActions'

const initialState = {
  currentUser: null,
  loggedIn: false,
  authenticated: false
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_IN_SUCCESS:
    case USER_AUTHENTICATE_SUCCESS:
      return {
        currentUser: action.payload.user,
        loggedIn: true,
        authenticated: true
      }
    case USER_SIGN_OUT_SUCCESS:
    case USER_AUTHENTICATE_ERROR:
      return {
        currentUser: null,
        loggedIn: false,
        authenticated: true
      }
    default:
      return state
  }
}

export default user
