import request from 'superagent'
import Alert from 'react-s-alert'
import { history, MAP, EDIT_USER_ACCOUNT } from '../AppRouter'
import config from '../configuration'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_IN_ERROR = 'USER_SIGN_IN_ERROR'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'
export const USER_SIGN_OUT_ERROR = 'USER_SIGN_OUT_ERROR'

export const USER_EDIT_ACCOUNT = 'USER_EDIT_ACCOUNT'

export const USER_OBTAIN_LOGIN_STATE = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_SUCCESS = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_ERROR = 'USER_OBTAIN_LOGIN_STATE_ERROR'

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
    .post(`${config.apiBaseUrl}/users/sign_in.json`, { user: payload })
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
  request.delete(`${config.apiBaseUrl}/users/sign_out`)
    .end((err, res) => {
      if (res.error) {
        dispatch(signOutError(err))
      } else {
        dispatch(signOutSuccess())
      }
    })
}

export const obtainLoginStateSuccess = payload =>
  ({ type: USER_OBTAIN_LOGIN_STATE_SUCCESS, payload })

export const obtainLoginStateError = (payload) => {
  Alert.error('Logininformationen konnten nicht abgefragt werden. Bitte versuche es erneut.')
  return ({ type: USER_OBTAIN_LOGIN_STATE_ERROR, payload, error: true })
}

export const obtainLoginState = () => (dispatch) => {
  request.get(`${config.apiBaseUrl}/users/me`)
    .end((err, res) => {
      if (res.error) {
        dispatch(obtainLoginStateError(err))
      } else {
        dispatch(obtainLoginStateSuccess(res.body))
      }
    })
}

export const editAccount = () => () => history.push(EDIT_USER_ACCOUNT);
