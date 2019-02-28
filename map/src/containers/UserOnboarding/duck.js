/*  __
___( o)>
\ <_. )
 `---'
*/
import Alert from 'react-s-alert'
import { SubmissionError } from 'redux-form'
import _ from 'lodash'

import { history, MAP } from '../../AppRouter'
import { authManagement, client } from '../../index'
import { transformServerResponse } from '../../common/formUtils'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_UP_SUCCESS = 'USER_SIGN_UP_SUCCESS'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'

export const USER_AUTHENTICATE = 'USER_AUTHENTICATE'
export const USER_AUTHENTICATE_SUCCESS = 'USER_AUTHENTICATE_SUCCESS'
export const USER_AUTHENTICATE_ERROR = 'USER_AUTHENTICATE_ERROR'

const initialState = {
  currentUser: null,
  loggedIn: false,
  authenticated: false
}

export const user = (state = initialState, action) => {
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

export const signInSuccess = res => {
  Alert.closeAll()
  Alert.success(`Hallo ${res.user.name}, Du hast Dich erfolgreich angemeldet.`)
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
    .catch(response => {
      dispatch(signInError(response))
      throw new SubmissionError(transformServerResponse(response))
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

export const signUp = payload => dispatch => {
  return client
    .service('users')
    .create(_.omit(payload, 'passwordConfirmation'))
    .then(response => dispatch(signUpSuccess(response)))
    .catch(response => {
      dispatch(signUpError(response))
      throw new SubmissionError(transformServerResponse(response))
    })
}

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

export const authenticateUserSuccess = payload => ({
  type: USER_AUTHENTICATE_SUCCESS,
  payload
})

export const authenticateUserError = payload => ({
  type: USER_AUTHENTICATE_ERROR,
  payload,
  error: true
})

export const authenticateUser = () => dispatch => {
  return client
    .authenticate()
    .then(res => dispatch(authenticateUserSuccess(res)))
    .catch(e => dispatch(authenticateUserError(e)))
}

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
  dispatch(authenticateUser())
  history.push(MAP)
}

export const updateUser = user => dispatch =>
  client
    .service('users')
    .patch(null, user)
    .then(res => {
      // TODO user identity change service for email change, send verification email
      // if (user.email) {
      //   const userEmail = _.pick(user, 'email')
      //   authManagement
      //     .identityChange(user.password, userEmail, userEmail)
      //     .then(res => dispatch(updateUserSuccess(res)))
      //     .catch(e => dispatch(updateUserError(e)))
      // } else {
      dispatch(updateUserSuccess(res))
      // }
    })
    .catch(e => dispatch(updateUserError(e)))

export const changePasswordError = ({ status, message }) => () => {
  Alert.error(`Dein Password konnte nicht geändert werden. / ${message}`)
}

export const changePasswordSuccess = () => dispatch => {
  Alert.success('Dein Passwort wurde erfolgreich geändert.')
  history.push(MAP)
}

export const changePassword = ({ oldPassword, password }, email) => {
  console.log('oldPassword', oldPassword)
  console.log('password', password)
  console.log('email', email)

  return dispatch =>
    authManagement
      .passwordChange(oldPassword, password, { email })
      .then(res => dispatch(changePasswordSuccess(res)))
      .catch(e => dispatch(changePasswordError(e)))
}

export const recoverPasswordSuccess = () => dispatch => {
  Alert.success(
    'Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.'
  )
  dispatch(authenticateUser())
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
  dispatch(authenticateUser())
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
