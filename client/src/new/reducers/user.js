import { USER_SIGN_IN_SUCCESS, USER_SIGN_IN_ERROR, USER_SIGN_OUT_SUCCESS, USER_SIGN_OUT_ERROR } from '../actions/user'

const initialState = {
  currentUser: null,
  loggedIn: false,
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_IN_SUCCESS:
      return {
        currentUser: action.payload,
        loggedIn: true,
      }
    case USER_SIGN_IN_ERROR:
      console.log(`login failed:  ${action.payload}`)
      return state
    case USER_SIGN_OUT_SUCCESS:
      return initialState
    case USER_SIGN_OUT_ERROR:
    default:
      return state
  }
}

export default user
