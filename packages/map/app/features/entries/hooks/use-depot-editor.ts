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
import {
  filterFarms,
  getInitialValues
} from '~/features/entries/utils/editor-utils'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/lib/routes'
import type { FeatureCollection } from '~/types/types'

interface DepotClientLoaderParams {
  params: { id?: string }
}

export const depotClientLoader = async ({
  params
}: DepotClientLoaderParams) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getEntriesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyEntryQuery({ type: 'depots', id }))
      : null
  ])
}

export type DepotEditorLoaderData = Awaited<
  ReturnType<typeof depotClientLoader>
>

interface UseDepotEditorOptions {
  mode: 'create' | 'update'
}

interface UseDepotEditorResult {
  title: string
  handleSubmit: (values: CreateDepotParams | UpdateDepotParams) => void
  farms: ReturnType<typeof filterFarms>
  initialValues: ReturnType<typeof getInitialValues>
  user: ReturnType<typeof useUserData>
  isSubmitting: boolean
}

export const useDepotEditor = ({
  mode
}: UseDepotEditorOptions): UseDepotEditorResult => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const initialData = useLoaderData() as DepotEditorLoaderData | undefined

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

  const handleSubmit = (values: CreateDepotParams | UpdateDepotParams) => {
    if (mode === 'create') {
      createDepotMutation.mutate(values as CreateDepotParams)
    }

    if (mode === 'update') {
      updateDepotMutation.mutate(values as UpdateDepotParams)
    }
  }

  const initialValues = getInitialValues(depotQuery.data, 'depot', mode)

  const farms = entriesQuery.data
    ? // TODO directly fetch farm entries only from backend
      filterFarms((entriesQuery.data as FeatureCollection).features)
    : []

  const user = useUserData()

  return {
    title:
      mode === 'create'
        ? t('forms.depot.create_title')
        : t('forms.depot.edit_title'),
    handleSubmit,
    farms,
    initialValues,
    user,
    isSubmitting: createDepotMutation.isPending || updateDepotMutation.isPending
  }
}
