import UserPasswordForm from './UserPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { updateUserPassword } from '../../api/user'
import Alert from 'react-s-alert'
import { history, MAP } from '../../AppRouter'
import { useGlobalState } from '../../StateContext'

const UserChangePassword = () => {
  const { currentUser } = useGlobalState()

  const updateUserPasswordMutation = useMutation({
    mutationFn: async (passwordChangeParams) => {
      const response = await updateUserPassword({
        email: currentUser.email,
        ...passwordChangeParams
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      history.push(MAP)
      return response
    },
    onError: (error) => {
      Alert.error(
        `Dein Passwort konnte nicht geändert werden. / ${error.message}`
      )
    }
  })

  const handleSubmit = (values) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}

export default UserChangePassword
