import {
  USER_SIGN_IN_SUCCESS,
  USER_SIGN_OUT_SUCCESS,
  USER_OBTAIN_LOGIN_STATE_SUCCESS,
  USER_OBTAIN_LOGIN_STATE_ERROR
} from './userActions'

const initialState = {
  currentUser: null,
  loggedIn: false
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_IN_SUCCESS:
    case USER_OBTAIN_LOGIN_STATE_SUCCESS:
      return {
        currentUser: action.payload.user,
        loggedIn: true
      }
    case USER_SIGN_OUT_SUCCESS:
    case USER_OBTAIN_LOGIN_STATE_ERROR:
      return {
        currentUser: null,
        loggedIn: false
      }
    default:
      return state
  }
}

export default user
