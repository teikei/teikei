import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import {
  type CreateInitiativeParams,
  useCreateInitiative
} from '~/api/create-initiative'
import { getBadgesQuery, useGetBadges } from '~/api/get-badges'
import { getEntriesQueryKey } from '~/api/get-entries'
import { getGoalsQuery, useGetGoals } from '~/api/get-goals'
import {
  getMyEntryQuery,
  getMyEntryQueryKey,
  useGetMyEntry
} from '~/api/get-my-entry'
import {
  type UpdateInitiativeParams,
  useUpdateInitiative
} from '~/api/update-initiative'
import { useUserData } from '~/api/use-user-data'
import InitiativeForm from '~/features/entries/components/initiative-form'
import { getInitialValues } from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'

interface EditorInitiativeProps {
  mode: 'create' | 'update'
}

export const clientLoader = async ({ params }: { params: { id?: string } }) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery({ type: 'initiatives', id }))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof clientLoader>>

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

  const goalsQuery = useGetGoals({ initialData: goalsQueryInitialData })

  const badgesQuery = useGetBadges({
    initialData: badgesQueryInitialData
  })

  const initiativeQuery = useGetMyEntry(
    { type: 'initiatives', id: id! },
    {
      initialData: myPlaceQueryInitialData
        ? myPlaceQueryInitialData
        : undefined,
      enabled: mode === 'update'
    }
  )

  const createInitiativeMutation = useCreateInitiative({
    onSuccess: (response) => {
      if (response.properties.id === undefined) {
        Alert.error(t('errors.initiative_not_created'))
        return
      }

      Alert.success(
        t('forms.initiative.entry_create_success', {
          name: response.properties.name
        })
      )
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
    }
  })

  const updateInitiativeMutation = useUpdateInitiative({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('errors.initiative_not_updated'))
        return
      }

      Alert.success(t('places.form.initiative.initiative_create_success'))
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
      queryClient.invalidateQueries({
        queryKey: getMyEntryQueryKey({ type: 'initiatives', id: id! })
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

  const InitiativeReduxForm = InitiativeForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('places.forms.initiative_create_title')
            : t('places.forms.initiative_edit_title')}
        </h1>
        <InitiativeReduxForm
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
