import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type CreateFarmParams, useCreateFarm } from '~/api/create-farm'
import { getBadgesQuery, useGetBadges } from '~/api/get-badges'
import { getEntriesQueryKey } from '~/api/get-entries'
import { getGoalsQuery, useGetGoals } from '~/api/get-goals'
import {
  getMyEntryQuery,
  getMyEntryQueryKey,
  useGetMyEntry
} from '~/api/get-my-entry'
import { getProductsQuery, useGetProducts } from '~/api/get-products'
import { type UpdateFarmParams, useUpdateFarm } from '~/api/update-farm'
import { useUserData } from '~/api/use-user-data'
import FarmForm from '~/features/entries/components/farm-form'
import { getInitialValues } from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'

interface EditorFarmProps {
  mode: 'create' | 'update'
}

export const clientLoader = async ({ params }: { params: { id?: string } }) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getProductsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery({ type: 'farms', id }))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof clientLoader>>

export const EditorFarm = ({ mode }: EditorFarmProps) => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [
    goalsQueryInitialData,
    productsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = initialData || []

  const goalsQuery = useGetGoals({ initialData: goalsQueryInitialData })

  const productsQuery = useGetProducts({
    initialData: productsQueryInitialData
  })

  const badgesQuery = useGetBadges({
    initialData: badgesQueryInitialData
  })

  const farmQuery = useGetMyEntry(
    { type: 'farms', id: id! },
    {
      initialData: myPlaceQueryInitialData
        ? myPlaceQueryInitialData
        : undefined,
      enabled: mode === 'update'
    }
  )

  const createFarmMutation = useCreateFarm({
    onSuccess: (response) => {
      if (response.properties.id === undefined) {
        Alert.error(t('errors.farm_not_created'))
        return
      }

      Alert.success(
        t('forms.farm.entry_create_success', {
          name: response.properties.name
        })
      )
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
    }
  })

  const updateFarmMutation = useUpdateFarm({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('errors.farm_not_created'))
        return
      }

      Alert.success(t('forms.farm.farm_create_success'))
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
      queryClient.invalidateQueries({
        queryKey: getMyEntryQueryKey({ type: 'farms', id: id! })
      })
    }
  })

  const handleSubmit = (depot: any) => {
    if (mode === 'create') {
      createFarmMutation.mutate(depot)
    }
    if (mode === 'update') {
      updateFarmMutation.mutate(depot)
    }
  }

  const initialValues = getInitialValues(farmQuery.data, 'farm', mode)

  const user = useUserData()

  const FarmReduxForm = FarmForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.farm.farm_create_title')
            : t('forms.farm.farm_edit_title')}
        </h1>
        <FarmReduxForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={user}
          products={productsQuery.data}
          goals={goalsQuery.data}
          badges={badgesQuery.data}
        />
      </div>
    </div>
  )
}
