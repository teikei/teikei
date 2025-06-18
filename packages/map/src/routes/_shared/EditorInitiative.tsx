import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type InitiativeFormData } from '../../common/validation/schemas'
import { InitiativeEditForm } from '../../components/places/InitiativeEditForm'
import { queryClient } from '../../main'
import {
  createInitiative,
  CreateInitiativeParams,
  updateInitiative,
  UpdateInitiativeParams
} from '../../queries/places.api'
import {
  getBadgesQuery,
  getEntriesQuery,
  getGoalsQuery,
  getMyEntryQuery
} from '../../queries/places.queries'
import { MAP } from '../../routes'
import { type Badge, type Goal } from '../../types/types'

interface EditorInitiativeProps {
  mode: 'create' | 'update'
}

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery('initiatives', id))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const EditorInitiative = ({ mode }: EditorInitiativeProps) => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [
    goalsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = initialData || []

  const goalsQuery = useQuery({
    ...getGoalsQuery(),
    initialData: goalsQueryInitialData
  })

  const badgesQuery = useQuery({
    ...getBadgesQuery(),
    initialData: badgesQueryInitialData
  })

  const initiativeQuery = useQuery({
    ...getMyEntryQuery('initiatives', id!),
    initialData: myPlaceQueryInitialData,
    enabled: mode === 'update'
  })

  const createInitiativeMutation = useMutation({
    mutationFn: async (initiative: CreateInitiativeParams) => {
      const response = await createInitiative(initiative)
      if (response.properties.id !== undefined) {
        Alert.success(
          t('forms.initiative.entry_create_success', {
            name: response.properties.name
          })
        )
        navigate(MAP)
      } else {
        throw new Error(t('errors.initiative_not_created'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getEntriesQuery().queryKey]
      })
    }
  })

  const updateInitiativeMutation = useMutation({
    mutationFn: async (initiative: UpdateInitiativeParams) => {
      const response = await updateInitiative(initiative)
      if (response.properties.id === initiative.id) {
        Alert.success(t('forms.initiative.entry_update_success'))
        navigate(MAP)
      } else {
        throw new Error(t('errors.initiative_not_updated'))
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getEntriesQuery().queryKey,
          getMyEntryQuery('initiatives', id!).queryKey
        ]
      })
    }
  })

  const handleSubmit = (data: InitiativeFormData) => {
    // Transform form data to API format
    const transformedData = {
      name: data.name,
      description: data.description,
      city: data.city,
      address: data.address,
      url: data.url || '',
      type: 'Initiative' as const,
      link: '',
      goals: data.goals || [],
      products: [],
      badges: data.badges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (mode === 'create') {
      createInitiativeMutation.mutate(
        transformedData as unknown as CreateInitiativeParams
      )
    }
    if (mode === 'update') {
      updateInitiativeMutation.mutate({
        ...transformedData,
        id: id!
      } as unknown as UpdateInitiativeParams)
    }
  }

  // Convert initiative data to form format for editing
  const getInitialData = (): Partial<InitiativeFormData> | undefined => {
    if (mode === 'create') return undefined

    const initiative = initiativeQuery.data
    if (!initiative) return undefined

    return {
      name: initiative.properties.name || '',
      url: initiative.properties.url || '',
      description: initiative.properties.description || '',
      city: initiative.properties.city || '',
      address: initiative.properties.address || '',
      latitude: initiative.geometry.coordinates[1],
      longitude: initiative.geometry.coordinates[0],
      goals: initiative.properties.goals?.map((g: Goal) => g.id) || [],
      badges: initiative.properties.badges?.map((b: Badge) => b.id) || []
    }
  }

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.initiative.initiative_create_title')
            : t('forms.initiative.initiative_edit_title')}
        </h1>
        <InitiativeEditForm
          initialData={getInitialData()}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
