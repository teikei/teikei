import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { type CreateDepotParams, createDepot } from '~/api/create-depot'
import { getEntriesQuery } from '~/api/get-entries'
import { getMyEntryQuery } from '~/api/get-my-entry'
import { type UpdateDepotParams, updateDepot } from '~/api/update-depot'
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

  const entriesQuery = useQuery({
    ...getEntriesQuery(),
    initialData: entriesQueryInitialData
  })

  const depotQuery = useQuery({
    ...getMyEntryQuery({ type: 'depots', id: id! }),
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
          getMyEntryQuery({ type: 'depots', id: id! }).queryKey
        ]
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
  const farms =
    entriesQuery && entriesQuery.data
      ? filterFarms((entriesQuery.data as FeatureCollection).features)
      : []

  const user = useUserData()

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create'
            ? t('forms.depot.create_title')
            : t('forms.depot.edit_title')}
        </h1>
        <DepotForm
          onSubmit={handleSubmit}
          farms={farms}
          initialValues={initialValues}
          user={user}
        />
      </div>
    </div>
  )
}
