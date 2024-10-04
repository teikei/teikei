import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import InitiativeForm from './components/InitiativeForm'
import Loading from '../../components/Loading/index'
import { useHistory, useParams } from 'react-router-dom'
import {
  createInitiative,
  getBadges,
  getGoals,
  getMyPlace,
  updateInitiative
} from '../../api/places'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { MAP } from '../../AppRouter'
import { getInitialValues, handleEditorError } from './editorUtils'

const EditorInitiative = ({ mode }) => {
  const { id } = useParams()
  const history = useHistory()

  const initiativeQuery = useQuery({
    queryKey: ['getMyPlace', 'initiative', id],
    queryFn: () => getMyPlace('initiative', id),
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

  const badgesQuery = useQuery({
    queryKey: ['getBadges'],
    queryFn: () => getBadges(),
    onError: (error) => {
      Alert.error(
        `Die Mitgliedschaften und Zertifizierungen konnten nicht geladen werden./ ${error.message}`
      )
    }
  })

  const createInitiativeMutation = useMutation({
    mutationFn: async (initiative) => {
      const response = await createInitiative(initiative)
      debugger
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

  const updateInitiativeMutation = useMutation({
    mutationFn: async (initiative) => {
      const response = await updateInitiative(initiative)
      if (response.properties.id === initiative.id) {
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

  const user = useSelector((state) => state.user.currentUser || {})

  if (
    (mode === 'update' && initiativeQuery.isLoading) ||
    goalsQuery.isLoading ||
    badgesQuery.isLoading
  ) {
    return <Loading />
  }

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

EditorInitiative.propTypes = {
  mode: PropTypes.string
}

EditorInitiative.defaultProps = {
  initialValues: {}
}

export default EditorInitiative
