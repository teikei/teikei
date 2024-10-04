import React from 'react'
import PropTypes from 'prop-types'
import { useQuery, useMutation } from '@tanstack/react-query'

import DepotForm from './components/DepotForm'
import Loading from '../../components/Loading/index'
import { useHistory, useParams } from 'react-router-dom'
import {
  createDepot,
  getEntries,
  getMyPlace,
  updateDepot
} from '../../api/places'
import Alert from 'react-s-alert'
import { MAP } from '../../AppRouter'
import { filterFarms, getInitialValues, handleEditorError } from './editorUtils'
import { useGlobalState } from '../../StateContext'

const EditorDepot = ({ mode }) => {
  const { id } = useParams()
  const history = useHistory()

  const depotQuery = useQuery({
    queryKey: ['getMyPlace', 'depot', id],
    queryFn: () => getMyPlace('depot', id),
    onError: (error) => {
      Alert.error(`Der Eintrag konnte nicht geladen werden / ${error.message}`)
    },
    enabled: mode === 'update'
  })

  // for farm selection
  const entriesQuery = useQuery({
    queryKey: ['getPlaces'],
    queryFn: () => getEntries(),
    onError: () => {
      Alert.error('Die Einträge konnten nicht geladen werden.')
    }
  })

  const createDepotMutation = useMutation({
    mutationFn: async (depot) => {
      const response = await createDepot(depot)
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

  const updateDepotMutation = useMutation({
    mutationFn: async (depot) => {
      const response = await updateDepot(depot)
      if (response.properties.id === depot.id) {
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
      createDepotMutation.mutate(depot)
    }
    if (mode === 'update') {
      updateDepotMutation.mutate(depot)
    }
  }

  const initialValues = getInitialValues(depotQuery.data, 'depot', mode)

  const farms =
    entriesQuery && entriesQuery.data
      ? filterFarms(entriesQuery.data.features)
      : []

  const { currentUser } = useGlobalState()

  if (mode === 'update' && depotQuery.isLoading) {
    return <Loading />
  }

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
          user={currentUser}
        />
      </div>
    </div>
  )
}

EditorDepot.propTypes = {
  mode: PropTypes.string
}

EditorDepot.defaultProps = {
  initialValues: {}
}

export default EditorDepot
