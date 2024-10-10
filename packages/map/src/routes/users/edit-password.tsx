import Alert from 'react-s-alert'

import UserPasswordForm, {
  PasswordChangeFormValues
} from '../../containers/UserChangePassword/UserPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { updateUserPassword } from '../../queries/user.api'
import { history, MAP } from '../../routes'
import { useGlobalState } from '../../StateContext'

export const Component = () => {
  const { currentUser } = useGlobalState()

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      password
    }: PasswordChangeFormValues) => {
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

  const handleSubmit = (values: PasswordChangeFormValues) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}
