import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { getInitialValues } from '../../common/editorUtils'
import InitiativeForm from '../../components/places/InitiativeForm'
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
import { useUserData } from '../../queries/users.queries.ts'
import { MAP } from '../../routes'

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
        Alert.success(t('places.form.initiative.initiative_create_success'))
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

  const user = useUserData()

  const handleSubmit = (depot: any) => {
    if (mode === 'create') {
      createInitiativeMutation.mutate(depot)
    }
    if (mode === 'update') {
      updateInitiativeMutation.mutate(depot)
    }
  }

  const initialValues = getInitialValues(
    initiativeQuery.data,
    'initiative',
    mode
  )

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('places.forms.initiative_create_title')
            : t('places.forms.initiative_edit_title')}
        </h1>
        <InitiativeForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={user}
          goals={goalsQuery.data}
          badges={badgesQuery.data}
        />
      </div>
    </div>
  )
}
