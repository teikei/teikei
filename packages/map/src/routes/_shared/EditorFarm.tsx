import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { useParams } from 'react-router-dom'
import Alert from 'react-s-alert'
import { getInitialValues } from '../../common/editorUtils'
import FarmForm from '../../components/places/FarmForm'
import { queryClient } from '../../main'
import {
  createFarm,
  CreateFarmParams,
  updateFarm,
  UpdateFarmParams
} from '../../queries/places.api'
import {
  getBadgesQuery,
  getEntriesQuery,
  getGoalsQuery,
  getMyEntryQuery,
  getProductsQuery
} from '../../queries/places.queries'
import { useUserData } from '../../queries/users.queries.ts'
import { MAP } from '../../routes'

interface EditorFarmProps {
  mode: 'create' | 'update'
}

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getProductsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery('farms', id))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

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
    ...getMyEntryQuery('farms', id!!),
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
          getMyEntryQuery('farms', id!!).queryKey
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
        {mode === 'create'
          ? t('forms.farm.farm_create_title')
          : t('forms.farm.farm_edit_title')}
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
