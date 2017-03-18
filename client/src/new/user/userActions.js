import request from 'superagent'
import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import config from '../configuration'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_IN_ERROR = 'USER_SIGN_IN_ERROR'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'
export const USER_SIGN_OUT_ERROR = 'USER_SIGN_OUT_ERROR'

export const USER_EDIT_ACCOUNT = 'USER_EDIT_ACCOUNT'

const apiBaseUrl = () => config.apiBaseUrl

export const signInSuccess = (payload) => {
  Alert.success(`Hallo ${payload.name}, Du hast Dich erfolgreich angemeldet!`)
  return ({ type: USER_SIGN_IN_SUCCESS, payload })
}

export const signInError = (payload) => {
  Alert.error('Anmeldung fehlgeschlagen!')
  return ({ type: USER_SIGN_IN_ERROR, payload, error: true })
}

export const signIn = payload => (dispatch) => {
  request
    .post(`${apiBaseUrl()}/users/sign_in.json`, { user: payload })
    .end((err, res) => {
      if (res.body.errors) {
        dispatch(signInError(res.body.errors))
      } else {
        dispatch(signInSuccess(res.body))
        history.push(MAP);
      }
    })
}

export const signOutSuccess = (payload) => {
  Alert.success('Du wurdest erfolgreich abgemeldet!')
  return ({ type: USER_SIGN_OUT_SUCCESS, payload })
}

export const signOutError = (payload) => {
  Alert.error('Du konntest nicht abgemeldet werden. Bitte versuche es erneut.')
  return ({ type: USER_SIGN_OUT_ERROR, payload, error: true })
}

export const signOut = () => (dispatch) => {
  request.delete(`${apiBaseUrl()}/users/sign_out`)
    .end((err, res) => {
      if (res.error) {
        dispatch(signOutError(err))
      } else {
        dispatch(signOutSuccess())
      }
    })
}

export const editAccount = payload => ({ type: USER_EDIT_ACCOUNT, payload })
