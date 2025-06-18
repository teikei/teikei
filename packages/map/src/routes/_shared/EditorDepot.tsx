import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { filterFarms } from '../../common/editorUtils'
import { type DepotFormData } from '../../common/validation/schemas'
import { DepotEditForm } from '../../components/places/DepotEditForm'
import { queryClient } from '../../main'
import {
  createDepot,
  CreateDepotParams,
  updateDepot,
  UpdateDepotParams
} from '../../queries/places.api'
import { getEntriesQuery, getMyEntryQuery } from '../../queries/places.queries'
import { MAP } from '../../routes'
import { FeatureCollection } from '../../types/types'

interface EditorDepotProps {
  mode: 'create' | 'update'
}

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getEntriesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery('depots', id))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const EditorDepot = ({ mode }: EditorDepotProps) => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [entriesQueryInitialData, myPlaceQueryInitialData] = initialData || []

  const entriesQuery = useQuery({
    ...getEntriesQuery(),
    initialData: entriesQueryInitialData
  })

  const depotQuery = useQuery({
    ...getMyEntryQuery('depots', id!),
    initialData: myPlaceQueryInitialData,
    enabled: mode === 'update'
  })

  const createDepotMutation = useMutation({
    mutationFn: async (depot: CreateDepotParams) => {
      const response = await createDepot(depot)
      if (response.properties.id !== undefined) {
        Alert.success(
          t('forms.depot.entry_create_success', {
            name: response.properties.name
          })
        )
        navigate(MAP)
      } else {
        throw new Error(t('errors.entry_not_created'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getEntriesQuery().queryKey]
      })
    }
  })

  const updateDepotMutation = useMutation({
    mutationFn: async (depot: UpdateDepotParams) => {
      const response = await updateDepot(depot)
      if (response.properties.id === depot.id) {
        Alert.success(t('forms.depot.entry_update_success'))
        navigate(MAP)
      } else {
        throw new Error(t('error.depot_edit_failed'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getEntriesQuery().queryKey,
          getMyEntryQuery('depots', id!).queryKey
        ]
      })
    }
  })

  const handleSubmit = (data: DepotFormData) => {
    // Transform form data to API format
    const transformedData = {
      name: data.name,
      description: data.description,
      city: data.city,
      address: data.address,
      url: data.url || '',
      deliveryDays: data.deliveryDays || '',
      type: 'Depot' as const,
      link: '',
      goals: [],
      products: [],
      badges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farms: data.farms || []
    }

    if (mode === 'create') {
      createDepotMutation.mutate(
        transformedData as unknown as CreateDepotParams
      )
    }
    if (mode === 'update') {
      updateDepotMutation.mutate({
        ...transformedData,
        id: id!
      } as unknown as UpdateDepotParams)
    }
  }

  // Convert depot data to form format for editing
  const getInitialData = (): Partial<DepotFormData> | undefined => {
    if (mode === 'create') return undefined

    const depot = depotQuery.data
    if (!depot) return undefined

    return {
      name: depot.properties.name || '',
      url: depot.properties.url || '',
      description: depot.properties.description || '',
      city: depot.properties.city || '',
      address: depot.properties.address || '',
      latitude: depot.geometry.coordinates[1],
      longitude: depot.geometry.coordinates[0],
      deliveryDays: depot.properties.deliveryDays || '',
      farms: depot.properties.farms || []
    }
  }

  // TODO directly fetch farm entries only from backend
  const farms =
    entriesQuery && entriesQuery.data
      ? filterFarms((entriesQuery.data as FeatureCollection).features)
      : []

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.depot.create_title')
            : t('forms.depot.edit_title')}
        </h1>
        <DepotEditForm initialData={getInitialData()} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
