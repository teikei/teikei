import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { history, MAP } from '../../AppRouter'
import { updateUser } from '../../api/user'
import UserAccountForm from './UserAccountForm'
import { useGlobalState } from '../../StateContext'

interface User {
  id: string
  // Add other user properties as needed
}

interface UserAccountFormProps {
  initialValues: User
  onSubmit: (values: User) => void
}

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

const UserAccount = (): JSX.Element => {
  const { currentUser } = useGlobalState()

  const updateUserMutation = useMutation({
    mutationFn: async (user: User) => {
      const response = await updateUser(user)
      if (response.id === user.id) {
        Alert.success('Dein Benutzerkonto wurde erfolgreich aktualisiert.')
        history.push(MAP)
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

export default UserAccount
