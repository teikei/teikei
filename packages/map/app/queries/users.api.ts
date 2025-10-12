// TODO replace client with plain fetch
import ky from 'ky'
import _ from 'lodash'
import configuration from '~/configuration'
import { getClient, throwApiError } from '~/queries/clients'

const { apiBaseUrl } = configuration

interface SignUpUserParams {
  email: string
  password: string
  name: string
  phone?: string
  baseurl: string
  locale: string
}

export async function signUpUser(signUpUserParams: SignUpUserParams) {
  return getClient()
    .service('users')
    .create(_.omit(signUpUserParams, 'passwordConfirmation'))
}

interface SignInUserParams {
  email: string
  password: string
}

export async function signInUser(signInUserParams: SignInUserParams) {
  return getClient().authenticate({
    email: signInUserParams.email,
    password: signInUserParams.password,
    strategy: 'local'
  })
}

export async function signOutUser() {
  return getClient().logout()
}

export async function reAuthenticateUser() {
  return getClient().reAuthenticate(true)
}

interface UpdateUserParams {
  id: string
  name: string
  phone?: string
  email: string
  locale?: string
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
  return getClient()
    .service('users')
    .patch(updateUserParams.id, updateUserParams)
}

export interface UpdateUserPasswordParams {
  oldPassword: string
  password: string
  email: string
}

export async function updateUserPassword(
  updateUserPasswordParams: UpdateUserPasswordParams
) {
  const { oldPassword, password, email } = updateUserPasswordParams
  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        headers: {
          Authorization: `Bearer ${await getClient().authentication.getAccessToken()}`
        },
        json: {
          action: 'passwordChange',
          value: { user: { email }, oldPassword, password }
        }
      })
      .json()
  } catch (error: any) {
    const errorResponse = await error.response.json()
    throw new Error(errorResponse.message)
  }
}

export interface RecoverUserPasswordParams {
  email: string
}

export async function recoverUserPassword(
  recoverPasswordParams: RecoverUserPasswordParams
) {
  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: {
          action: 'sendResetPwd',
          value: recoverPasswordParams
        }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

interface ResetUserPasswordParams {
  resetPasswordToken: string
  password: string
}

export async function resetUserPassword(
  resetUserPasswordParams: ResetUserPasswordParams
) {
  const { resetPasswordToken, password } = resetUserPasswordParams
  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: {
          action: 'resetPwdLong',
          value: { token: resetPasswordToken, password }
        }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

export interface ConfirmUserParams {
  confirmationToken: string
}

export async function confirmUser(confirmUserParams: ConfirmUserParams) {
  const { confirmationToken } = confirmUserParams
  try {
    return await ky
      .post(`${apiBaseUrl}/authManagement`, {
        json: { action: 'verifySignupLong', value: confirmationToken }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}

export interface ReactivateUserParams {
  id: string
  token: string
}

export async function reactivateUser(
  reactivateUserParams: ReactivateUserParams
) {
  const { id, token } = reactivateUserParams
  try {
    return await ky
      .post(`${apiBaseUrl}/user-reactivation`, {
        json: { id, token }
      })
      .json()
  } catch (error) {
    await throwApiError(error)
  }
}
