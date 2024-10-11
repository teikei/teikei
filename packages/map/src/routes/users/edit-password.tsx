import Alert from 'react-s-alert'
import { useMutation } from '@tanstack/react-query'

import UserPasswordForm, {
  PasswordChangeFormValues
} from '../../components/users/UserPasswordForm'
import { updateUserPassword } from '../../queries/users.api.ts'
import { MAP } from '../../routes'
import { useGlobalState } from '../../StateContext'
import { useNavigate } from 'react-router'

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
