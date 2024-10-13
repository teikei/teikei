import Alert from 'react-s-alert'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import RecoverPasswordForm from '../../components/users/UserRecoverPasswordForm'
import {
  recoverUserPassword,
  RecoverUserPasswordParams
} from '../../queries/users.api'
import { MAP } from '../../routes'

export const Component = () => {
  const navigate = useNavigate()
  const recoverPasswordMutation = useMutation({
    mutationFn: async (user: RecoverUserPasswordParams) => {
      const response = await recoverUserPassword(user)
      Alert.success(
        'Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.'
      )
      // TODO reauth
      // dispatch(authenticateUser())
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: 'Dein Passwort konnte nicht aktualisiert werden. '
    }
  })

  const handleSubmit = (values: RecoverUserPasswordParams) => {
    recoverPasswordMutation.mutate(values)
  }

  return <RecoverPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
