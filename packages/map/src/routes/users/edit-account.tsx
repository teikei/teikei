import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate } from 'react-router'

import { MAP } from '../../routes'
import { updateUser } from '../../queries/users.api'
import UserAccountForm from '../../components/users/UserAccountForm'
import { useGlobalState } from '../../StateContext'
import { User } from '../../types/types'

export const Component = () => {
  const { currentUser } = useGlobalState()
  const navigate = useNavigate()

  const updateUserMutation = useMutation({
    mutationFn: async (user: User) => {
      const response = await updateUser(user)
      if (response.id === user.id) {
        Alert.success('Dein Benutzerkonto wurde erfolgreich aktualisiert.')
        navigate(MAP)
      } else {
        throw new Error('Benutzerkonto wurde nicht aktualisiert.')
      }
      return response
    },
    meta: {
      errorMessage: 'Dein Benutzerkonto konnte nicht gespeichert werden'
    }
  })

  const handleSubmit = (values: User) => {
    updateUserMutation.mutate(values)
  }

  return <UserAccountForm initialValues={currentUser} onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
