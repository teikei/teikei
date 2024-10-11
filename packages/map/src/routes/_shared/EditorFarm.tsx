import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate } from 'react-router'

import FarmForm from '../../components/places/FarmForm'
import Loading from '../../components/base/Loading'
import {
  createFarm,
  getBadges,
  getGoals,
  getMyPlace,
  getProducts,
  updateFarm
} from '../../queries/places.api'
import { getInitialValues, handleEditorError } from '../../common/editorUtils'
import { MAP } from '../../routes'
import { useGlobalState } from '../../StateContext'

interface EditorFarmProps {
  mode: 'create' | 'update'
}

const EditorFarm = ({ mode }: EditorFarmProps) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const farmQuery = useQuery({
    queryKey: ['getMyPlace', 'farm', id],
    queryFn: () => getMyPlace('farm', id),
    onError: (error) => {
      Alert.error(`Der Eintrag konnte nicht geladen werden / ${error.message}`)
    },
    enabled: mode === 'update'
  })

  const goalsQuery = useQuery({
    queryKey: ['getGoals'],
    queryFn: () => getGoals(),
    onError: (error) => {
      Alert.error(`Die Ziele konnten nicht geladen werden./ ${error.message}`)
    }
  })

  const productsQuery = useQuery({
    queryKey: ['getProducts'],
    queryFn: () => getProducts(),
    onError: (error) => {
      Alert.error(
        `Die Produkte konnten nicht geladen werden./ ${error.message}`
      )
    }
  })

  const badgesQuery = useQuery({
    queryKey: ['getBadges'],
    queryFn: () => getBadges(),
    onError: (error) => {
      Alert.error(
        `Die Mitgliedschaften und Zertifizierungen konnten nicht geladen werden./ ${error.message}`
      )
    }
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

  const { currentUser } = useGlobalState()

  if (
    (mode === 'update' && farmQuery.isLoading) ||
    goalsQuery.isLoading ||
    productsQuery.isLoading ||
    badgesQuery.isLoading
  ) {
    return <Loading />
  }

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        {mode === 'create' ? 'Neuen Betrieb eintragen' : 'Betrieb editieren'}
        <FarmForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          user={currentUser}
          products={productsQuery.data}
          goals={goalsQuery.data}
          badges={badgesQuery.data}
        />
      </div>
    </div>
  )
}

export default EditorFarm
