import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'

import UserRecoverPasswordForm from '../../components/users/UserRecoverPasswordForm'
import {
  recoverUserPassword,
  RecoverUserPasswordParams
} from '../../queries/users.api'
import { MAP } from '../../routes'

export const Component = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const recoverPasswordMutation = useMutation({
    mutationFn: async (user: RecoverUserPasswordParams) => {
      const response = await recoverUserPassword(user)
      Alert.success(t('forms.user.recover_password_success'))
      // TODO reauth
      // dispatch(authenticateUser())
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: t('errors.recover_password_failed')
    }
  })

  const handleSubmit = (values: RecoverUserPasswordParams) => {
    recoverPasswordMutation.mutate(values)
  }

  return <UserRecoverPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
