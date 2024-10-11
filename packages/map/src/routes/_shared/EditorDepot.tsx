import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import Alert from 'react-s-alert'
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router'

import DepotForm from '../../components/places/DepotForm'
import Loading from '../../components/base/Loading'
import { createDepot, updateDepot } from '../../queries/places.api'
import { MAP } from '../../routes'
import {
  filterFarms,
  getInitialValues,
  handleEditorError
} from '../../common/editorUtils'
import { useGlobalState } from '../../StateContext'
import { getEntriesQuery, getMyPlaceQuery } from '../../queries/places.queries'
import { queryClient } from '../../App'
import { rootLoaderData } from '../../root.tsx'

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

export const EditorDepot = ({ mode }: EditorDepotProps) => {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const [entriesQueryInitialData, myPlaceQueryInitialData] =
    useLoaderData() as Awaited<ReturnType<typeof loader>>

  const entriesQuery = useQuery({
    ...getEntriesQuery(),
    ...entriesQueryInitialData,
    onError: () => {
      Alert.error('Die Einträge konnten nicht geladen werden.')
    }
  })

  const depotQuery = useQuery({
    ...getMyPlaceQuery('depots', id!!),
    ...myPlaceQueryInitialData,
    onError: (error) => {
      Alert.error(`Der Eintrag konnte nicht geladen werden / ${error.message}`)
    },
    enabled: mode === 'update'
  })

  const createDepotMutation = useMutation({
    mutationFn: async (depot) => {
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
    onError: (error) => {
      handleEditorError(error)
    }
  })

  const updateDepotMutation = useMutation({
    mutationFn: async (depot) => {
      const response = await updateDepot(depot)
      if (response.properties.id === depot.id) {
        Alert.success('Dein Eintrag wurde erfolgreich aktualisiert.')
        navigate(MAP)
      } else {
        throw new Error('Eintrag wurde nicht aktualisiert.')
      }
      return response
    },
    onError: (error) => {
      handleEditorError(error)
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
      ? filterFarms(entriesQuery.data.features)
      : []

  const rootLoaderData = useRouteLoaderData('root') as rootLoaderData

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
