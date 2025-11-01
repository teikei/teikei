import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import EditAccountForm from '~/components/users/EditAccountForm'
import { requireUser } from '~/lib/require-user'
import { MAP } from '~/lib/routes'
import type { EditAccountFormData } from '~/lib/validation/schemas'
import { updateUser } from '~/queries/users.api'
import { useUserData } from '~/queries/users.queries'

import type { Route } from './+types/users.editAccount'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  await requireUser(request)
  return null
}

export default function EditAccountRoute() {
  const { t } = useTranslation()
  const user = useUserData()
  const navigate = useNavigate()

  const updateUserMutation = useMutation({
    mutationFn: async (userData: EditAccountFormData & { id: string }) => {
      const { password, ...userDataWithoutPassword } = userData
      const response = await updateUser(userDataWithoutPassword)
      if (response.id === userData.id) {
        Alert.success(t('forms.useraccount.update_success'))
        navigate(MAP)
      } else {
        throw new Error(t('errors.update_user_account_failed'))
      }
      return response
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.update_user_account_save_failed'))
    }
  })

  const handleSubmit = (values: EditAccountFormData & { id: string }) => {
    updateUserMutation.mutate(values)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <EditAccountForm
      initialValues={user}
      onSubmit={handleSubmit}
      isLoading={updateUserMutation.isPending}
    />
  )
}

export function ErrorBoundary() {
  return <div>Unable to edit account.</div>
}
