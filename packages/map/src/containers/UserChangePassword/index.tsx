import UserPasswordForm from './UserPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { updateUserPassword } from '../../api/user'
import Alert from 'react-s-alert'
import { history, MAP } from '../../AppRouter'
import { useGlobalState } from '../../StateContext'

interface PasswordChangeParams {
  currentPassword: string
  password: string
}

const UserChangePassword = () => {
  const { currentUser } = useGlobalState()

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, password }: PasswordChangeParams) => {
      if (!currentUser) {
        history.push(MAP)
        return null
      }
      const response = await updateUserPassword({
        currentPassword,
        password,
        email: currentUser.email
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      history.push(MAP)
      return response
    },
    onError: (error: { message: string }) => {
      Alert.error(
        `Dein Passwort konnte nicht geändert werden. / ${error.message}`
      )
    }
  })

  const handleSubmit = (values: PasswordChangeParams) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}

export default UserChangePassword
