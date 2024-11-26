import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'

import UserResetPasswordForm from '../../components/users/UserResetPasswordForm'
import { resetUserPassword } from '../../queries/users.api'
import { MAP, useQueryString } from '../../routes'

interface PasswordResetParams {
  password: string
  passwordConfirmation: string
}

export const Component = () => {
  const { t } = useTranslation()
  const { getQueryString, clearQueryString } = useQueryString()
  const navigate = useNavigate()

  useEffect(() => {
    const queryString = getQueryString()
    // don't allow access without reset_password_token
    if (!queryString.has('reset_password_token')) {
      clearQueryString()
      navigate(MAP)
    }
  }, [getQueryString, clearQueryString, navigate])

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordResetParams) => {
      const queryString = getQueryString()
      const response = await resetUserPassword({
        resetPasswordToken: queryString.get('reset_password_token')!,
        password
      })
      Alert.success(t('forms.user.password_reset_success'))
      // TODO reauth
      // dispatch(authenticateUser())
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: t('error.reset_password_failed')
    }
  })

  const handleSubmit = (values: PasswordResetParams) => {
    resetPasswordMutation.mutate(values)
  }

  return <UserResetPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
