import Alert from 'react-s-alert'
import { SubmissionError } from 'redux-form'
import _ from 'lodash'

import { history, MAP } from '../AppRouter'
import request, { formSubmitter } from '../common/request'
import config from '../configuration'
import { authManagement, client } from '../App'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_UP_SUCCESS = 'USER_SIGN_UP_SUCCESS'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'

export const USER_OBTAIN_LOGIN_STATE = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_SUCCESS = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_ERROR = 'USER_OBTAIN_LOGIN_STATE_ERROR'

export const signInSuccess = res => {
  Alert.closeAll()
  Alert.success(`Hallo ${res.name}, Du hast Dich erfolgreich angemeldet.`)
  history.push(MAP)
  return { type: USER_SIGN_IN_SUCCESS, payload: res }
}

export const signInError = () => () => {
  Alert.closeAll()
  Alert.error(
    'Du konntest nicht angemeldet werden. Bitte überprüfe Deine Angaben.'
  )
}

export const signIn = payload => dispatch =>
  client
    .authenticate({
      email: payload.email,
      password: payload.password,
      strategy: 'local'
    })
    .then(res => dispatch(signInSuccess(res)))
    .catch(e => {
      dispatch(signInError(e))
      throw new SubmissionError(e)
    })

export const signUpSuccess = ({ body }) => ({
  type: USER_SIGN_UP_SUCCESS,
  payload: body
})

export const signUpError = () => () => {
  Alert.closeAll()
  Alert.error(
    'Du konntest nicht registriert werden. Bitte überprüfe Deine Angaben.'
  )
}

export const signUp = payload => dispatch =>
  client
    .service('users')
    .create(_.omit(payload, 'password_confirmation'))
    .then(response => dispatch(signUpSuccess(response)))
    .catch(response => {
      dispatch(signUpError(response))
      throw new SubmissionError(response)
    })

export const signOutSuccess = payload => {
  Alert.closeAll()
  Alert.success('Du wurdest erfolgreich abgemeldet.')
  history.push(MAP)
  return { type: USER_SIGN_OUT_SUCCESS, payload }
}

export const signOutError = () => {
  Alert.closeAll()
  Alert.error('Du konntest nicht abgemeldet werden. Bitte versuche es erneut.')
}

export const signOut = () => dispatch =>
  client
    .logout()
    .then(res => dispatch(signOutSuccess(res)))
    .catch(e => dispatch(signOutError(e)))

export const obtainLoginStateSuccess = payload => ({
  type: USER_OBTAIN_LOGIN_STATE_SUCCESS,
  payload
})

export const obtainLoginStateError = payload => ({
  type: USER_OBTAIN_LOGIN_STATE_ERROR,
  payload,
  error: true
})

export const obtainLoginState = () => dispatch =>
  client
    .authenticate()
    .then(res => dispatch(obtainLoginStateSuccess(res)))
    .catch(e => dispatch(obtainLoginStateError(e)))

export const updateUserError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (status === 422) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${message}`
    )
  }
}

export const updateUserSuccess = () => dispatch => {
  Alert.success('Dein Benutzerkonto wurde erfolgreich aktualisiert.')
  dispatch(obtainLoginState())
  history.push(MAP)
}

// TODO
export const updateUser = user => dispatch =>
  formSubmitter(
    request.put(`${config.apiBaseUrl}/users.json`, { user }),
    () => dispatch(updateUserSuccess(user)),
    res => dispatch(updateUserError(res))
  )

export const recoverPasswordSuccess = () => dispatch => {
  Alert.success(
    'Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.'
  )
  dispatch(obtainLoginState())
  history.push(MAP)
}

export const recoverPasswordError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (status === 422) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${message}`
    )
  }
}

export const recoverPassword = user => dispatch =>
  authManagement
    .sendResetPwd(user)
    .then(res => dispatch(recoverPasswordSuccess(res)))
    .catch(e => dispatch(recoverPasswordError(e)))

export const confirmUserError = ({ message }) => () => {
  Alert.error(`Dein Benutzerkonto konnto nicht aktiviert werden: ${message}`)
  history.push(MAP)
}

export const confirmUserSuccess = () => () => {
  Alert.success(
    'Vielen Dank! Dein Benutzerkonto wurde bestätigt und ist nun freigeschaltet.'
  )
  history.push(MAP)
}

export const confirmUser = confirmationToken => dispatch =>
  authManagement
    .verifySignupLong(confirmationToken)
    .then(res => dispatch(confirmUserSuccess(res)))
    .catch(e => dispatch(confirmUserError(e)))

export const resetPasswordSuccess = () => dispatch => {
  Alert.success('Dein Passwort wurde erfolgreich geändert.')
  dispatch(obtainLoginState())
  history.push(MAP)
}

export const resetPasswordError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (status === 422) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${message}`
    )
  }
}

export const resetPassword = payload => dispatch =>
  authManagement
    .resetPwdLong(payload.reset_password_token, payload.password)
    .then(res => dispatch(resetPasswordSuccess(res)))
    .catch(e => dispatch(resetPasswordError(e)))
