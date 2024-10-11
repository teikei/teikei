import { useParams } from 'react-router-dom'
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import InitiativeForm from '../../components/places/InitiativeForm'
import Loading from '../../components/base/Loading'
import { createInitiative, updateInitiative } from '../../queries/places.api'
import { MAP } from '../../routes'
import { getInitialValues, handleEditorError } from '../../common/editorUtils'
import { useGlobalState } from '../../StateContext'
import {
  getBadgesQuery,
  getGoalsQuery,
  getMyPlaceQuery
} from '../../queries/places.queries.ts'
import { queryClient } from '../../App.tsx'
import { rootLoaderData } from '../../root.tsx'

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
      ? queryClient.fetchQuery(getMyPlaceQuery('initiatives', id))
      : null
  ])
}

export const EditorInitiative = ({ mode }: EditorInitiativeProps) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [
    goalsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = useLoaderData() as Awaited<ReturnType<typeof loader>>

  const goalsQuery = useQuery({
    ...getGoalsQuery(),
    initialData: goalsQueryInitialData,
    onError: (error) => {
      Alert.error(`Die Ziele konnten nicht geladen werden./ ${error.message}`)
    }
  })

  const badgesQuery = useQuery({
    ...getBadgesQuery(),
    initialData: badgesQueryInitialData,
    onError: (error) => {
      Alert.error(
        `Die Mitgliedschaften und Zertifizierungen konnten nicht geladen werden./ ${error.message}`
      )
    }
  })

  const initiativeQuery = useQuery({
    ...getMyPlaceQuery('initiatives', id!!),
    initialData: myPlaceQueryInitialData,
    onError: (error) => {
      Alert.error(`Der Eintrag konnte nicht geladen werden / ${error.message}`)
    },
    enabled: mode === 'update'
  })

  const createInitiativeMutation = useMutation({
    mutationFn: async (initiative) => {
      const response = await createInitiative(initiative)
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

  const updateInitiativeMutation = useMutation({
    mutationFn: async (initiative) => {
      const response = await updateInitiative(initiative)
      if (response.properties.id === initiative.id) {
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

  const { user } = useRouteLoaderData('root') as rootLoaderData

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        {mode === 'create'
          ? 'Neue Initiative eintragen'
          : 'Initiative editieren'}
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
