import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import UserAccountForm from '../../components/users/UserAccountForm'
import { updateUser } from '../../queries/users.api'
import { useUserData } from '../../queries/users.queries.ts'
import { MAP } from '../../routes'
import { User } from '../../types/types'

export const Component = () => {
  const { t } = useTranslation()
  const user = useUserData()

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
