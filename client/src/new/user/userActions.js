import Alert from 'react-s-alert'
import { history, MAP } from '../AppRouter'
import request, { formSubmitter } from '../common/request'
import config from '../configuration'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_UP_SUCCESS = 'USER_SIGN_UP_SUCCESS'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'

export const USER_OBTAIN_LOGIN_STATE = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_SUCCESS = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_ERROR = 'USER_OBTAIN_LOGIN_STATE_ERROR'

export const signInSuccess = (res) => {
  Alert.closeAll()
  Alert.success(`Hallo ${res.name}, Du hast Dich erfolgreich angemeldet.`)
  history.push(MAP);
  return ({ type: USER_SIGN_IN_SUCCESS, payload: res })
}

export const signInError = () => () => {
  Alert.closeAll()
  Alert.error('Du konntest nicht angemeldet werden. Bitte überprüfe Deine Angaben.')
}

export const signIn = payload => dispatch => formSubmitter(
  request.post(`${config.apiBaseUrl}/users/sign_in.json`, { user: payload }),
  response => dispatch(signInSuccess(response)),
  response => dispatch(signInError(response)),
)

export const signUpSuccess = ({ body }) => {
  Alert.closeAll()
  history.push(MAP);
  Alert.success(`Hallo ${body.name}, Du hast Dich erfolgreich angemeldet. \
   Wir haben Dir eine Bestätigungsemail geschickt, mit der du Deine Registrierung abschließen kannst.`)
  return ({ type: USER_SIGN_UP_SUCCESS, payload: body })
}

export const signUpError = () => () => {
  Alert.closeAll()
  Alert.error('Du konntest nicht registriert werden. Bitte überprüfe Deine Angaben.')
}

export const signUp = payload => dispatch => formSubmitter(
  request.post(`${config.apiBaseUrl}/users.json`, { user: payload }),
  response => dispatch(signUpSuccess(response)),
  response => dispatch(signUpError(response)),
)

export const signOutSuccess = (payload) => {
  Alert.closeAll()
  Alert.success('Du wurdest erfolgreich abgemeldet.')
  return ({ type: USER_SIGN_OUT_SUCCESS, payload })
}

export const signOutError = () => {
  Alert.closeAll()
  Alert.error('Du konntest nicht abgemeldet werden. Bitte versuche es erneut.')
}

export const signOut = () => (dispatch) => {
  request
    .del(`${config.apiBaseUrl}/users/sign_out`)
    .then(() => dispatch(signOutSuccess()))
    .catch(res => dispatch(signOutError(res)))
}

export const obtainLoginStateSuccess = payload =>
  ({ type: USER_OBTAIN_LOGIN_STATE_SUCCESS, payload })

export const obtainLoginStateError = (payload) => {
  Alert.closeAll()
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


export const updateUserError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error('Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.')
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(`Dein Benutzerkonto konnte nicht gespeichert werden / ${message}`)
  }
}

export const recoverPasswordError = ({ status, message }) => () => {
  if (status === 401) {
    Alert.error('Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.')
  } else if (status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(`Dein Benutzerkonto konnte nicht gespeichert werden / ${message}`)
  }
}


export const updateUserSuccess = () => (dispatch) => {
  Alert.success('Deine Benutzerkonto wurde erfolgreich aktualisiert.')
  dispatch(obtainLoginState());
  history.push(MAP);
}

export const recoverPasswordSuccess = () => (dispatch) => {
  Alert.success('Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.')
  dispatch(obtainLoginState());
  history.push(MAP);
}

export const updateUser = user => dispatch => formSubmitter(
  request.put(`${config.apiBaseUrl}/users.json`, { user }),
  () => dispatch(updateUserSuccess(user)),
  res => dispatch(updateUserError(res)),
)


export const recoverPassword = user => dispatch => formSubmitter(
  request.post(`${config.apiBaseUrl}/users/password.json`, { user }),
  () => dispatch(recoverPasswordSuccess(user)),
  res => dispatch(recoverPasswordError(res)),
)
