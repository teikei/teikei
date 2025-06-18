import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type FarmFormData } from '../../common/validation/schemas'
import { FarmEditForm } from '../../components/places/FarmEditForm'
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
import { MAP } from '../../routes'
import { type Badge, type Product } from '../../types/types'

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
    ...getMyEntryQuery('farms', id!),
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
          getMyEntryQuery('farms', id!).queryKey
        ]
      })
    }
  })

  const handleSubmit = (data: FarmFormData) => {
    // Transform form data to API format
    const transformedData = {
      name: data.name,
      description: data.description,
      city: data.city,
      address: data.address,
      url: data.url || '',
      type: 'Farm' as const,
      link: '',
      goals: [],
      products: data.products || [],
      badges: data.badges || [],
      additionalProductInformation: data.additionalProductInformation || '',
      actsEcological: data.actsEcological || false,
      economicalBehavior: data.economicalBehavior || '',
      foundedAtYear: data.foundedAtYear,
      foundedAtMonth: data.foundedAtMonth,
      acceptsNewMembers: data.acceptsNewMembers,
      maximumMembers: data.maximumMembers,
      participation: data.participation || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (mode === 'create') {
      createFarmMutation.mutate(transformedData as unknown as CreateFarmParams)
    }
    if (mode === 'update') {
      updateFarmMutation.mutate({
        ...transformedData,
        id: id!
      } as unknown as UpdateFarmParams)
    }
  }

  // Convert farm data to form format for editing
  const getInitialData = (): Partial<FarmFormData> | undefined => {
    if (mode === 'create') return undefined

    const farm = farmQuery.data
    if (!farm) return undefined

    return {
      name: farm.properties.name || '',
      url: farm.properties.url || '',
      description: farm.properties.description || '',
      city: farm.properties.city || '',
      address: farm.properties.address || '',
      latitude: farm.geometry.coordinates[1],
      longitude: farm.geometry.coordinates[0],
      products: farm.properties.products?.map((p: Product) => p.id) || [],
      additionalProductInformation:
        farm.properties.additionalProductInformation || '',
      actsEcological: farm.properties.actsEcological || false,
      economicalBehavior: farm.properties.economicalBehavior || '',
      foundedAtYear: farm.properties.foundedAtYear,
      foundedAtMonth: farm.properties.foundedAtMonth,
      acceptsNewMembers: farm.properties.acceptsNewMembers,
      maximumMembers: farm.properties.maximumMembers,
      participation: farm.properties.participation || '',
      badges: farm.properties.badges?.map((b: Badge) => b.id) || []
    }
  }

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.farm.farm_create_title')
            : t('forms.farm.farm_edit_title')}
        </h1>
        <FarmEditForm initialData={getInitialData()} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
