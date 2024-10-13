import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router'

import FarmForm from '../../components/places/FarmForm'
import { createFarm, updateFarm } from '../../queries/places.api'
import { getInitialValues } from '../../common/editorUtils'
import { MAP } from '../../routes'
import { queryClient } from '../../App'
import {
  getBadgesQuery,
  getEntriesQuery,
  getGoalsQuery,
  getMyEntryQuery,
  getProductsQuery
} from '../../queries/places.queries'
import { RootLoaderData } from '../../root'
import { CreateFarmParams, UpdateFarmParams } from '../../types/types'

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
      ? queryClient.fetchQuery(getMyEntryQuery('farms', id))
      : null
  ])
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const EditorFarm = ({ mode }: EditorFarmProps) => {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const initialData = useLoaderData() as LoaderData
  const [
    goalsQueryInitialData,
    productsQueryInitialData,
    badgesQueryInitialData,
    myPlaceQueryInitialData
  ] = initialData || []

  const goalsQuery = useQuery({
    ...getGoalsQuery(),
    initialData: goalsQueryInitialData
  })

  const productsQuery = useQuery({
    ...getProductsQuery(),
    initialData: productsQueryInitialData
  })

  const badgesQuery = useQuery({
    ...getBadgesQuery(),
    initialData: badgesQueryInitialData
  })

  const farmQuery = useQuery({
    ...getMyEntryQuery('farms', id!!),
    initialData: myPlaceQueryInitialData,
    enabled: mode === 'update'
  })

  const createFarmMutation = useMutation({
    mutationFn: async (farm: CreateFarmParams) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getEntriesQuery().queryKey]
      })
    }
  })

  const updateFarmMutation = useMutation({
    mutationFn: async (farm: UpdateFarmParams) => {
      const response = await updateFarm(farm)
      if (response.properties.id === farm.id) {
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
          getMyEntryQuery('farms', id!!).queryKey
        ]
      })
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

  const rootLoaderData = useRouteLoaderData('root') as RootLoaderData

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
