import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type CreateFarmParams, createFarm } from '~/api/create-farm'
import { getBadgesQuery } from '~/api/get-badges'
import { getEntriesQuery } from '~/api/get-entries'
import { getGoalsQuery } from '~/api/get-goals'
import { getMyEntryQuery } from '~/api/get-my-entry'
import { getProductsQuery } from '~/api/get-products'
import { type UpdateFarmParams, updateFarm } from '~/api/update-farm'
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

  const goalsQuery = useQuery({
    ...getGoalsQuery(),
    initialData: goalsQueryInitialData
  })

  const productsQuery = useQuery({
    ...getProductsQuery(),
    initialData: productsQueryInitialData
  })

  const badgesQuery = useQuery({
    ...getBadgesQuery(),
    initialData: badgesQueryInitialData
  })

  const farmQuery = useQuery({
    ...getMyEntryQuery({ type: 'farms', id: id! }),
    initialData: myPlaceQueryInitialData,
    enabled: mode === 'update'
  })

  const createFarmMutation = useMutation({
    mutationFn: async (farm: CreateFarmParams) => {
      const response = await createFarm(farm)
      if (response.properties.id !== undefined) {
        Alert.success(
          t('forms.farm.entry_create_success', {
            name: response.properties.name
          })
        )
        navigate(MAP)
      } else {
        throw new Error(t('errors.farm_not_created'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getEntriesQuery().queryKey]
      })
    }
  })

  const updateFarmMutation = useMutation({
    mutationFn: async (farm: UpdateFarmParams) => {
      const response = await updateFarm(farm)
      if (response.properties.id === farm.id) {
        Alert.success(t('forms.farm.farm_create_success'))
        navigate(MAP)
      } else {
        throw new Error(t('errors.farm_not_created'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getEntriesQuery().queryKey,
          getMyEntryQuery({ type: 'farms', id: id! }).queryKey
        ]
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

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.farm.farm_create_title')
            : t('forms.farm.farm_edit_title')}
        </h1>
        <FarmForm
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
