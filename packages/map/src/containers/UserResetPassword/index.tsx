import { useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { MAP, useQueryString } from '../../AppRouter'
import UserRecoverPasswordForm from '../UserRecoverPassword/UserRecoverPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { resetUserPassword } from '../../api/user'
import Alert from 'react-s-alert'

interface PasswordResetParams {
  password: string
  passwordConfirmation: string
}

const UserResetPassword = ({ history }: RouteComponentProps): JSX.Element => {
  const queryString = useQueryString()

  useEffect(() => {
    // don't allow access without reset_password_token
    if (!queryString.has('reset_password_token')) {
      history.push(MAP)
    }
  }, [queryString, history])

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordResetParams) => {
      const response = await resetUserPassword({
        resetPasswordToken: queryString.get('reset_password_token')!,
        password
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      // TODO reauth
      // dispatch(authenticateUser())
      history.push(MAP)
      return response
    },
    onError: (error: { message: string }) => {
      Alert.error(
        `Dein Passwort konnte nicht wiederhergestellt werden. / ${error.message}`
      )
    }
  })

  const handleSubmit = (values: PasswordResetParams) => {
    resetPasswordMutation.mutate(values)
  }

  return <UserRecoverPasswordForm onSubmit={handleSubmit} />
}

export default withRouter(UserResetPassword)
