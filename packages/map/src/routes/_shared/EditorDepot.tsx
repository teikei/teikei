import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import Alert from 'react-s-alert'
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router'

import DepotForm from '../../components/places/DepotForm'
import { createDepot, updateDepot } from '../../queries/places.api'
import { MAP } from '../../routes'
import { filterFarms, getInitialValues } from '../../common/editorUtils'
import { getEntriesQuery, getMyPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../App'
import { RootLoaderData } from '../../root'
import {
  CreateDepotParams,
  FeatureCollection,
  UpdateDepotParams
} from '../../types/types'

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
      ? queryClient.fetchQuery(getMyPlaceQuery('depots', id))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const EditorDepot = ({ mode }: EditorDepotProps) => {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [entriesQueryInitialData, myPlaceQueryInitialData] = initialData || []

  const entriesQuery = useQuery({
    ...getEntriesQuery(),
    initialData: entriesQueryInitialData
  })

  const depotQuery = useQuery({
    ...getMyPlaceQuery('depots', id!!),
    initialData: myPlaceQueryInitialData,
    enabled: mode === 'update'
  })

  const createDepotMutation = useMutation({
    mutationFn: async (depot: CreateDepotParams) => {
      const response = await createDepot(depot)
      if (response.properties.id !== undefined) {
        Alert.success(
          `Dein Eintrag <strong>${response.properties.name}</strong> wurde erfolgreich gespeichert.`
        )
        navigate(MAP)
      } else {
        throw new Error('Eintrag wurde nicht angelegt.')
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
        Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
        navigate(MAP)
      } else {
        throw new Error('Eintrag wurde nicht aktualisiert.')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getEntriesQuery().queryKey,
          getMyPlaceQuery('depots', id!!).queryKey
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

  const rootLoaderData = useRouteLoaderData('root') as RootLoaderData

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create' ? 'Neues Depot eintragen' : 'Depot editieren'}
        </h1>
        <DepotForm
          onSubmit={handleSubmit}
          farms={farms}
          initialValues={initialValues}
          user={rootLoaderData.user}
        />
      </div>
    </div>
  )
}
