import { authManagement, client } from '../main.tsx'
import _ from 'lodash'

type User = {
  id: string
}

type ChangePasswordParams = {
  oldPassword: string
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
  oldPassword,
  password,
  email
}: ChangePasswordParams) {
  return authManagement.passwordChange(oldPassword, password, { email })
}

export async function recoverUserPassword(user: User) {
  return authManagement.sendResetPwd(user)
}

export async function signInUser(loginParams: LoginParams) {
  return client.authenticate({
    email: loginParams.email,
    password: loginParams.password,
    strategy: 'local'
  })
}

export async function signUpUser(signUpParams: SignUpParams) {
  return client
    .service('users')
    .create(_.omit(signUpParams, 'passwordConfirmation'))
}
