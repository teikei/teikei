import request from 'superagent'
import { browserHistory } from 'react-router'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_IN_ERROR = 'USER_SIGN_IN_ERROR'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'
export const USER_SIGN_OUT_ERROR = 'USER_SIGN_OUT_ERROR'

export const USER_EDIT_ACCOUNT = 'USER_EDIT_ACCOUNT'

export const signInSuccess = payload => ({ type: USER_SIGN_IN_SUCCESS, payload })
export const signInError = payload => ({ type: USER_SIGN_IN_ERROR, payload, error: true })

export const signIn = payload => (dispatch) => {
  request
    .post('/users/sign_in.json', { user: payload })
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(signInError(res.body.errors))
      } else {
        dispatch(signInSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const signOutSuccess = payload => ({ type: USER_SIGN_OUT_SUCCESS, payload })
export const signOutError = payload => ({ type: USER_SIGN_OUT_ERROR, payload, error: true })

export const signOut = () => (dispatch) => {
  request.delete('/users/sign_out')
    .end((err, res) => {
      if (res.error) {
        // res.body.errors.forEach(e => console.log(e));
        dispatch(signOutError(err))
      } else {
        dispatch(signOutSuccess())
        // Teikei.currentUser = {}
        // browserHistory.push('/new')
      }
    })
}


export const editAccount = payload => ({ type: USER_EDIT_ACCOUNT, payload })
