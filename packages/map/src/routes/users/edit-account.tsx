import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate, useRouteLoaderData } from 'react-router'
import { useTranslation } from 'react-i18next'

import { MAP } from '../../routes'
import { updateUser } from '../../queries/users.api'
import UserAccountForm from '../../components/users/UserAccountForm'
import { User } from '../../types/types'
import { RootLoaderData } from '../../root'

export const Component = () => {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('root') as RootLoaderData

  const navigate = useNavigate()

  const updateUserMutation = useMutation({
    mutationFn: async (user: User) => {
      const response = await updateUser(user)
      if (response.id === user.id) {
        Alert.success(t('forms.useraccount.update_success'))
        navigate(MAP)
      } else {
        throw new Error(t('errors.update_user_account_failed'))
      }
      return response
    },
    meta: {
      errorMessage: t('errors.update_user_account_save_failed')
    }
  })

  const handleSubmit = (values: User) => {
    updateUserMutation.mutate(values)
  }

  return <UserAccountForm initialValues={user} onSubmit={handleSubmit} />
}

export const ErrorBoundary = Component
