import _ from 'lodash'

import { authManagement, client } from './clients'
import { User } from '../types/types'

type ChangePasswordParams = {
  currentPassword: string
  password: string
  email: string
}

type LoginParams = {
  email: string
  password: string
}

type SignUpParams = {
  email: string
  password: string
  passwordConfirmation: string
}

type ResetPasswordParams = {
  resetPasswordToken: string
  password: string
}

type UserConfirmationParams = {
  confirmationToken: string
}

export type UserReactivationParams = {
  id: string
  token: string
}

export type RecoverPasswordParams = {
  email: string
}

export async function signUpUser(signUpParams: SignUpParams) {
  return client
    .service('users')
    .create(_.omit(signUpParams, 'passwordConfirmation'))
}

export async function signInUser(loginParams: LoginParams) {
  return client.authenticate({
    email: loginParams.email,
    password: loginParams.password,
    strategy: 'local'
  })
}

export async function signOutUser() {
  return client.logout()
}

export async function reAuthenticateUser() {
  return client.reAuthenticate()
}

export async function updateUser(user: User) {
  // TODO user identity change service for email change, send verification email
  // if (user.email) {
  //   const userEmail = _.pick(user, 'email')
  //   authManagement
  //     .identityChange(user.password, userEmail, userEmail)
  //     .then(res => dispatch(updateUserSuccess(res)))
  //     .catch(e => dispatch(updateUserError(e)))
  // } else {
  return client.service('users').patch(user.id, user)
}

export async function updateUserPassword({
  currentPassword,
  password,
  email
}: ChangePasswordParams) {
  return authManagement.passwordChange(currentPassword, password, { email })
}

export async function recoverUserPassword(user: RecoverPasswordParams) {
  return authManagement.sendResetPwd(user)
}

export async function resetUserPassword(
  resetPasswordParams: ResetPasswordParams
) {
  return authManagement.resetPwdLong(
    resetPasswordParams.resetPasswordToken,
    resetPasswordParams.password
  )
}

export async function confirmUser({
  confirmationToken
}: UserConfirmationParams) {
  return authManagement.verifySignupLong(confirmationToken)
}

export async function reactivateUser({ id, token }: UserReactivationParams) {
  return client.service('/user-reactivation').create({ id, token })
}
