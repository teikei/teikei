import { useTranslation } from 'react-i18next'
import { useNavigate, useRouteLoaderData } from 'react-router'
import Alert from 'react-s-alert'
import { useUpdateUserPassword } from '~/api/update-user-password'
import UserPasswordForm from '~/features/auth/components/user-password-form'
import type { UserPasswordFormValues } from '~/features/auth/components/user-password-form'
import { requireUser } from '~/lib/require-user'
import { MAP } from '~/lib/routes'
import type { RootLoaderData } from '~/root'

import type { Route } from '../../../../app/features/auth/pages/+types/edit-password'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  return requireUser(request)
}

export default function EditPasswordRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useRouteLoaderData('root') as RootLoaderData

  const updateUserPasswordMutation = useUpdateUserPassword({
    meta: {
      errorMessage: t('errors.password_change_failed')
    },
    onSuccess: () => {
      Alert.success(t('forms.user.password_change_success'))
      navigate(MAP)
    }
  })

  const handleSubmit = (values: UserPasswordFormValues) => {
    if (!user) {
      navigate(MAP)
      return
    }

    updateUserPasswordMutation.mutate({
      ...values,
      email: user.email
    })
  }

  const UserPasswordReduxForm = UserPasswordForm as any

  return <UserPasswordReduxForm onSubmit={handleSubmit} />
}

export function ErrorBoundary() {
  return <div>Unable to update password.</div>
}
