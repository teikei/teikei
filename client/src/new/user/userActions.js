import Alert from 'react-s-alert'
import { history, MAP, EDIT_USER_ACCOUNT } from '../AppRouter'
import request, { handleValidationErrors } from '../common/request'
import config from '../configuration'

export const USER_SIGN_IN_SUCCESS = 'USER_SIGN_IN_SUCCESS'
export const USER_SIGN_IN_ERROR = 'USER_SIGN_IN_ERROR'

export const USER_SIGN_OUT_SUCCESS = 'USER_SIGN_OUT_SUCCESS'
export const USER_SIGN_OUT_ERROR = 'USER_SIGN_OUT_ERROR'

export const USER_EDIT_ACCOUNT = 'USER_EDIT_ACCOUNT'

export const USER_OBTAIN_LOGIN_STATE = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_SUCCESS = 'USER_OBTAIN_LOGIN_STATE'
export const USER_OBTAIN_LOGIN_STATE_ERROR = 'USER_OBTAIN_LOGIN_STATE_ERROR'

export const signInSuccess = ({ body }) => {
  Alert.closeAll()
  Alert.success(`Hallo ${body.name}, Du hast Dich erfolgreich angemeldet.`)
  history.push(MAP);
  return ({ type: USER_SIGN_IN_SUCCESS, payload: body })
}

export const signInError = ({ response, status, message }) => {
  Alert.closeAll()
  Alert.error('Du konntest nicht angemeldet werden. Bitte überprüfe Deine Angaben.')
  handleValidationErrors(response);
}

export const signIn = payload => (dispatch) => {
  request
    .post(`${config.apiBaseUrl}/users/sign_in.json`, { user: payload })
    .then(res => dispatch(signInSuccess(res)))
    .catch(signInError)
}

export const signOutSuccess = (payload) => {
  Alert.closeAll()
  Alert.success('Du wurdest erfolgreich abgemeldet.')
  return ({ type: USER_SIGN_OUT_SUCCESS, payload })
}

export const signOutError = ({ response, status, message }) => {
  Alert.closeAll()
  Alert.error('Du konntest nicht abgemeldet werden. Bitte versuche es erneut.')
  return ({ type: USER_SIGN_OUT_ERROR, response, error: true })
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

export const editAccount = () => () => history.push(EDIT_USER_ACCOUNT);
