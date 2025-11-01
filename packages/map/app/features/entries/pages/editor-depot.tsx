import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type CreateDepotParams, useCreateDepot } from '~/api/create-depot'
import {
  getEntriesQuery,
  getEntriesQueryKey,
  useGetEntries
} from '~/api/get-entries'
import {
  getMyEntryQuery,
  getMyEntryQueryKey,
  useGetMyEntry
} from '~/api/get-my-entry'
import { type UpdateDepotParams, useUpdateDepot } from '~/api/update-depot'
import { useUserData } from '~/api/use-user-data'
import DepotForm from '~/features/entries/components/depot-form'
import {
  filterFarms,
  getInitialValues
} from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'
import type { FeatureCollection } from '~/types/types'

interface EditorDepotProps {
  mode: 'create' | 'update'
}

export const clientLoader = async ({ params }: { params: { id?: string } }) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getEntriesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery({ type: 'depots', id }))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof clientLoader>>

export const EditorDepot = ({ mode }: EditorDepotProps) => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [entriesQueryInitialData, myPlaceQueryInitialData] = initialData || []

  const entriesQuery = useGetEntries({
    initialData: entriesQueryInitialData ?? undefined
  })

  const depotQuery = useGetMyEntry(
    { type: 'depots', id: id! },
    {
      initialData: myPlaceQueryInitialData
        ? myPlaceQueryInitialData
        : undefined,
      enabled: mode === 'update'
    }
  )

  const createDepotMutation = useCreateDepot({
    onSuccess: (response) => {
      if (response.properties.id === undefined) {
        Alert.error(t('errors.entry_not_created'))
        return
      }

      Alert.success(
        t('forms.depot.entry_create_success', {
          name: response.properties.name
        })
      )
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
    }
  })

  const updateDepotMutation = useUpdateDepot({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('error.depot_edit_failed'))
        return
      }

      Alert.success(t('forms.depot.entry_update_success'))
      navigate(MAP)
      queryClient.invalidateQueries({ queryKey: getEntriesQueryKey })
      queryClient.invalidateQueries({
        queryKey: getMyEntryQueryKey({ type: 'depots', id: id! })
      })
    }
  })

  const handleSubmit = (depot: any) => {
    if (mode === 'create') {
      createDepotMutation.mutate(depot)
    }
    if (mode === 'update') {
      updateDepotMutation.mutate(depot)
    }
  }

  const initialValues = getInitialValues(depotQuery.data, 'depot', mode)

  // TODO directly fetch farm entries only from backend
  const farms = entriesQuery.data
    ? filterFarms((entriesQuery.data as FeatureCollection).features)
    : []

  const user = useUserData()

  const DepotReduxForm = DepotForm as any

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.depot.create_title')
            : t('forms.depot.edit_title')}
        </h1>
        <DepotReduxForm
          onSubmit={handleSubmit}
          farms={farms}
          initialValues={initialValues}
          user={user}
        />
      </div>
    </div>
  )
}
