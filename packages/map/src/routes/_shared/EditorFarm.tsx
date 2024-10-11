import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router'

import FarmForm from '../../components/places/FarmForm'
import Loading from '../../components/base/Loading'
import { createFarm, updateFarm } from '../../queries/places.api'
import { getInitialValues, handleEditorError } from '../../common/editorUtils'
import { MAP } from '../../routes'
import { useGlobalState } from '../../StateContext'
import { queryClient } from '../../App'
import {
  getBadgesQuery,
  getGoalsQuery,
  getMyPlaceQuery,
  getProductsQuery
} from '../../queries/places.queries.ts'
import { rootLoaderData } from '../../root.tsx'

interface EditorFarmProps {
  mode: 'create' | 'update'
}

interface LoaderParams {
  params: { id: string }
}

export const loader = async ({ params }: LoaderParams) => {
  const { id } = params
  return Promise.all([
    queryClient.fetchQuery(getGoalsQuery()),
    queryClient.fetchQuery(getProductsQuery()),
    queryClient.fetchQuery(getBadgesQuery()),
    id !== undefined
      ? queryClient.fetchQuery(getMyPlaceQuery('farms', id))
      : null
  ])
}

export const EditorFarm = ({ mode }: EditorFarmProps) => {
  const { id } = useParams<{ id: string }>()
  console.log('id', id)

  const navigate = useNavigate()

  const [
    goalsQueryInitialData,
    productsQueryInitialData,
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

  const productsQuery = useQuery({
    ...getProductsQuery(),
    initialData: productsQueryInitialData,
    onError: (error) => {
      Alert.error(
        `Die Produkte konnten nicht geladen werden./ ${error.message}`
      )
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

  const farmQuery = useQuery({
    ...getMyPlaceQuery('farms', id!!),
    initialData: myPlaceQueryInitialData,
    onError: (error) => {
      Alert.error(`Der Eintrag konnte nicht geladen werden / ${error.message}`)
    },
    enabled: mode === 'update'
  })

  const createFarmMutation = useMutation({
    mutationFn: async (farm) => {
      const response = await createFarm(farm)
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

  const updateFarmMutation = useMutation({
    mutationFn: async (farm) => {
      const response = await updateFarm(farm)
      if (response.properties.id === farm.id) {
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
      createFarmMutation.mutate(depot)
    }
    if (mode === 'update') {
      updateFarmMutation.mutate(depot)
    }
  }

  const initialValues = getInitialValues(farmQuery.data, 'farm', mode)

  const rootLoaderData = useRouteLoaderData('root') as rootLoaderData

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        {mode === 'create' ? 'Neuen Betrieb eintragen' : 'Betrieb editieren'}
        <FarmForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={rootLoaderData.user}
          products={productsQuery.data}
          goals={goalsQuery.data}
          badges={badgesQuery.data}
        />
      </div>
    </div>
  )
}
