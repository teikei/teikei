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
import { getInitialValues } from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'

export const farmClientLoader = async ({
  params
}: {
  params: { id?: string }
}) => {
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

export type FarmEditorLoaderData = Awaited<ReturnType<typeof farmClientLoader>>

type InferQueryData<T> = T extends { data: infer Data } ? Data : undefined

interface UseFarmEditorOptions {
  mode: 'create' | 'update'
}

interface UseFarmEditorResult {
  title: string
  handleSubmit: (values: CreateFarmParams | UpdateFarmParams) => void
  initialValues: ReturnType<typeof getInitialValues>
  user: ReturnType<typeof useUserData>
  goals: InferQueryData<ReturnType<typeof useGetGoals>>
  products: InferQueryData<ReturnType<typeof useGetProducts>>
  badges: InferQueryData<ReturnType<typeof useGetBadges>>
  isSubmitting: boolean
}

export const useFarmEditor = ({
  mode
}: UseFarmEditorOptions): UseFarmEditorResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const initialData = useLoaderData() as FarmEditorLoaderData | undefined
  const [
    goalsQueryInitialData,
    productsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = initialData || []

  const goalsQuery = useGetGoals({
    initialData: goalsQueryInitialData ?? undefined
  })

  const productsQuery = useGetProducts({
    initialData: productsQueryInitialData ?? undefined
  })

  const badgesQuery = useGetBadges({
    initialData: badgesQueryInitialData ?? undefined
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

  const handleSubmit = (values: CreateFarmParams | UpdateFarmParams) => {
    if (mode === 'create') {
      createFarmMutation.mutate(values as CreateFarmParams)
    }

    if (mode === 'update') {
      updateFarmMutation.mutate(values as UpdateFarmParams)
    }
  }

  const initialValues = getInitialValues(farmQuery.data, 'farm', mode)

  const user = useUserData()

  return {
    title:
      mode === 'create'
        ? t('forms.farm.farm_create_title')
        : t('forms.farm.farm_edit_title'),
    handleSubmit,
    initialValues,
    user,
    goals: goalsQuery.data,
    products: productsQuery.data,
    badges: badgesQuery.data,
    isSubmitting: createFarmMutation.isPending || updateFarmMutation.isPending
  }
}
