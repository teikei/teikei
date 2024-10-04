import { authManagement, client } from '../main.tsx'

type User = {
  id: string
}

type ChangePasswordParams = {
  oldPassword: string
  password: string
  email: string
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
