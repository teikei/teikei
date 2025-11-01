import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useRouteLoaderData } from 'react-router'
import Alert from 'react-s-alert'
import { updateUserPassword } from '~/api/update-user-password'
import UserPasswordForm from '~/features/auth/components/user-password-form'
import type { UserPasswordFormValues } from '~/features/auth/components/user-password-form'
import { requireUser } from '~/lib/require-user'
import { MAP } from '~/lib/routes'
import type { RootLoaderData } from '~/root'

import type { Route } from './+types/users.editPassword'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  return requireUser(request)
}

export default function EditPasswordRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useRouteLoaderData('root') as RootLoaderData

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, password }: UserPasswordFormValues) => {
      if (!user) {
        navigate(MAP)
        return null
      }
      const response = await updateUserPassword({
        oldPassword,
        password,
        email: user.email
      })
      Alert.success(t('forms.user.password_change_success'))
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: t('errors.password_change_failed')
    }
  })

  const handleSubmit = (values: UserPasswordFormValues) => {
    updateUserPasswordMutation.mutate(values)
  }

  return <UserPasswordForm onSubmit={handleSubmit} />
}

export function ErrorBoundary() {
  return <div>Unable to update password.</div>
}
