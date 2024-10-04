import React from 'react'
import PropTypes from 'prop-types'

import FarmForm from './components/FarmForm'
import Loading from '../../components/Loading/index'
import { useHistory, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createFarm,
  getBadges,
  getGoals,
  getMyPlace,
  getProducts,
  updateFarm
} from '../../api/places'
import Alert from 'react-s-alert'
import { getInitialValues, handleEditorError } from './editorUtils'
import { MAP } from '../../AppRouter'
import { useGlobalState } from '../../StateContext'

const EditorFarm = ({ mode }) => {
  const { id } = useParams()
  const history = useHistory()

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
        history.push(MAP)
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
        history.push(MAP)
      } else {
        throw new Error('Eintrag wurde nicht aktualisiert.')
      }
      return response
    },
    onError: (error) => {
      handleEditorError(error)
    }
  })

  const handleSubmit = (depot) => {
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

EditorFarm.propTypes = {
  mode: PropTypes.string
}

EditorFarm.defaultProps = {
  initialValues: {}
}

export default EditorFarm
