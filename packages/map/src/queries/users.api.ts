import _ from 'lodash'

import { authManagement, client } from './clients'

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
  return authManagement.passwordChange(currentPassword, password, { email })
}

export interface RecoverUserPasswordParams {
  email: string
}

export async function recoverUserPassword(
  recoverPasswordParams: RecoverUserPasswordParams
) {
  return authManagement.sendResetPwd(recoverPasswordParams)
}

interface ResetUserPasswordParams {
  resetPasswordToken: string
  password: string
}

export async function resetUserPassword(
  resetUserPasswordParams: ResetUserPasswordParams
) {
  const { resetPasswordToken, password } = resetUserPasswordParams
  return authManagement.resetPwdLong(resetPasswordToken, password)
}

export interface ConfirmUserParams {
  confirmationToken: string
}

export async function confirmUser(confirmUserParams: ConfirmUserParams) {
  const { confirmationToken } = confirmUserParams
  return authManagement.verifySignupLong(confirmationToken)
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
