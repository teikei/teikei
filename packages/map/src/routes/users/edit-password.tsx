import Alert from 'react-s-alert'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import UserPasswordForm, {
  PasswordChangeFormValues
} from '../../components/users/UserPasswordForm'
import { updateUserPassword } from '../../queries/users.api'
import { MAP } from '../../routes'
import { useGlobalState } from '../../StateContext'

export const Component = () => {
  const navigate = useNavigate()
  const { currentUser } = useGlobalState()

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      password
    }: PasswordChangeFormValues) => {
      if (!currentUser) {
        navigate(MAP)
        return null
      }
      const response = await updateUserPassword({
        currentPassword,
        password,
        email: currentUser.email
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: 'Dein Passwort konnte nicht geändert werden.'
    }
  })

  const handleSubmit = (values: PasswordChangeFormValues) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
