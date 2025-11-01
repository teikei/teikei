import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { useUpdateUser } from '~/api/update-user'
import { useUserData } from '~/api/use-user-data'
import EditAccountForm from '~/features/account/components/edit-account-form'
import { requireUser } from '~/lib/require-user'
import { MAP } from '~/routes'
import type { EditAccountFormData } from '~/lib/validation/schemas'

import type { Route } from '../../../../app/features/account/pages/+types/edit-account'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  await requireUser(request)
  return null
}

export default function EditAccountRoute() {
  const { t } = useTranslation()
  const user = useUserData()
  const navigate = useNavigate()

  const updateUserMutation = useUpdateUser({
    onSuccess: (response, variables) => {
      if (response.id !== variables.id) {
        Alert.closeAll()
        Alert.error(t('errors.update_user_account_failed'))
        return
      }

      Alert.success(t('forms.useraccount.update_success'))
      navigate(MAP)
    },
    onError: (error: any) => {
      Alert.closeAll()
      Alert.error(error.message || t('errors.update_user_account_save_failed'))
    }
  })

  const handleSubmit = (values: EditAccountFormData & { id: string }) => {
    const { password, ...userDataWithoutPassword } = values
    updateUserMutation.mutate(userDataWithoutPassword)
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
