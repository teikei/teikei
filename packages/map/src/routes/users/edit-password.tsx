import Alert from 'react-s-alert'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useRouteLoaderData } from 'react-router'

import UserPasswordForm, {
  UserPasswordFormValues
} from '../../components/users/UserPasswordForm'
import { updateUserPassword } from '../../queries/users.api'
import { MAP } from '../../routes'
import { RootLoaderData } from '../../root.tsx'

export const Component = () => {
  const navigate = useNavigate()
  const { user } = useRouteLoaderData('root') as RootLoaderData

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, password }: UserPasswordFormValues) => {
      if (!user) {
        // TODO replace this with protected route (no access to this page when not logged in)
        navigate(MAP)
        return null
      }
      const response = await updateUserPassword({
        oldPassword,
        password,
        email: user.email
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: 'Dein Passwort konnte nicht geändert werden.'
    }
  })

  const handleSubmit = (values: UserPasswordFormValues) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
