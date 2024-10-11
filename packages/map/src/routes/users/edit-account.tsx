import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import { MAP } from '../../routes'
import { updateUser } from '../../queries/users.api.ts'
import UserAccountForm from '../../components/users/UserAccountForm'
import { useGlobalState } from '../../StateContext'
import { User } from '../../types/types.ts'

function handleUserAccountError(error: { code: number; message: string }) {
  if (error.code === 401) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (error.code === 422) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${error.message}`
    )
  }
}

export const Component = () => {
  const { currentUser } = useGlobalState()

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
    onError: (error) => {
      handleUserAccountError(error)
    }
  })

  const handleSubmit = (values: User) => {
    updateUserMutation.mutate(values)
  }

  return <UserAccountForm initialValues={currentUser} onSubmit={handleSubmit} />
}
