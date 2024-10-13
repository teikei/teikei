import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate } from 'react-router'

import { MAP, useQueryString } from '../../routes'
import UserRecoverPasswordForm from '../../components/users/UserRecoverPasswordForm'
import { resetUserPassword } from '../../queries/users.api'

interface PasswordResetParams {
  password: string
  passwordConfirmation: string
}

export const Component = () => {
  const queryString = useQueryString()
  const navigate = useNavigate()

  useEffect(() => {
    // don't allow access without reset_password_token
    if (!queryString.has('reset_password_token')) {
      navigate(MAP)
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
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: 'Dein Passwort konnte nicht wiederhergestellt werden'
    }
  })

  const handleSubmit = (values: PasswordResetParams) => {
    resetPasswordMutation.mutate(values)
  }

  return <UserRecoverPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
