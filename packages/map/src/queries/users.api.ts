import _ from 'lodash'

// TODO replace client with plain fetch
import { client } from './clients'
import configuration from '../configuration.ts'
import ky from 'ky'

const { apiBaseUrl } = configuration

interface SignUpUserParams {
  email: string
  password: string
  passwordConfirmation: string
}

export async function signUpUser(signUpUserParams: SignUpUserParams) {
  return client
    .service('users')
    .create(_.omit(signUpUserParams, 'passwordConfirmation'))
}

interface SignInUserParams {
  email: string
  password: string
}

export async function signInUser(signInUserParams: SignInUserParams) {
  return client.authenticate({
    email: signInUserParams.email,
    password: signInUserParams.password,
    strategy: 'local'
  })
}

export async function signOutUser() {
  return client.logout()
}

export async function reAuthenticateUser() {
  return client.reAuthenticate()
}

interface UpdateUserParams {
  id: string
  name: string
  email: string
}

export async function updateUser(updateUserParams: UpdateUserParams) {
  // TODO user identity change service for email change, send verification email
  // if (user.email) {
  //   const userEmail = _.pick(user, 'email')
  //   authManagement
  //     .identityChange(user.password, userEmail, userEmail)
  //     .then(res => dispatch(updateUserSuccess(res)))
  //     .catch(e => dispatch(updateUserError(e)))
  // } else {
  return client.service('users').patch(updateUserParams.id, updateUserParams)
}

interface UpdateUserPasswordParams {
  currentPassword: string
  password: string
  email: string
}

export async function updateUserPassword(
  updateUserPasswordParams: UpdateUserPasswordParams
) {
  const { currentPassword, password, email } = updateUserPasswordParams
  return ky
    .post(`${apiBaseUrl}/authManagement`, {
      json: {
        action: 'passwordChange',
        value: { user: { email }, oldPassword: currentPassword, password }
      }
    })
    .json()
}

export interface RecoverUserPasswordParams {
  email: string
}

export async function recoverUserPassword(
  recoverPasswordParams: RecoverUserPasswordParams
) {
  return ky
    .post(`${apiBaseUrl}/authManagement`, {
      json: {
        action: 'sendResetPwd',
        value: recoverPasswordParams
      }
    })
    .json()
}

interface ResetUserPasswordParams {
  resetPasswordToken: string
  password: string
}

export async function resetUserPassword(
  resetUserPasswordParams: ResetUserPasswordParams
) {
  const { resetPasswordToken, password } = resetUserPasswordParams
  return ky
    .post(`${apiBaseUrl}/authManagement`, {
      json: {
        action: 'resetPwdLong',
        value: { token: resetPasswordToken, password }
      }
    })
    .json()
}

export interface ConfirmUserParams {
  confirmationToken: string
}

export async function confirmUser(confirmUserParams: ConfirmUserParams) {
  const { confirmationToken } = confirmUserParams
  return ky
    .post(`${apiBaseUrl}/authManagement`, {
      json: { action: 'verifySignupLong', value: confirmationToken }
    })
    .json()
}

export interface ReactivateUserParams {
  id: string
  token: string
}

export async function reactivateUser(
  reactivateUserParams: ReactivateUserParams
) {
  const { id, token } = reactivateUserParams
  return client.service('/user-reactivation').create({ id, token })
}
