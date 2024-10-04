import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery, useMutation } from '@tanstack/react-query'
import _ from 'lodash'
import { initialValues as joiInitialValues } from '../../common/validation'

import DepotForm from './components/DepotForm'
import Loading from '../../components/Loading/index'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { clearSearch } from '../Search/duck'
import { useHistory, useParams } from 'react-router-dom'
import {
  createDepot,
  getBadges,
  getEntries,
  getGoals,
  getMyPlace,
  getProducts,
  updateDepot
} from '../query'
import Alert from 'react-s-alert'
import { MAP } from '../../AppRouter'

const filterFarms = (features) => {
  const farms = features.filter((p) => p.properties.type === 'Farm')
  return farms.map(({ properties: { id, name } }) => ({ id, name }))
}

const getInitialValues = (feature, type, mode) => {
  if (mode === 'update') {
    return feature
      ? _.pick(
          {
            ...feature.properties,
            ...(feature.properties.farms && {
              farms: feature.properties.farms.features.map(
                ({ properties: { id, name } }) => ({
                  id,
                  name
                })
              )
            }),
            ...(feature.properties.goals && {
              goals: feature.properties.goals.map(({ id }) => id)
            }),
            ...(feature.properties.products && {
              products: feature.properties.products.map(({ id }) => id)
            }),
            ...(feature.properties.badges && {
              badges: feature.properties.badges.map(({ id }) => id)
            }),
            latitude: getLatitude(feature),
            longitude: getLongitude(feature)
          },
          ['id', ..._.keys(joiInitialValues[type])]
        )
      : {}
  }
  return joiInitialValues[type]
}

const handleEditorError = (error) => {
  if (error.status === 401) {
    Alert.error(
      'Dein Eintrag konnte nicht gespeichert werden. Bitte überprüfe, ob du angemeldet bist.'
    )
  } else if (error.status === 422) {
    Alert.error('Bitte überprüfe deine Eingaben.')
  } else {
    Alert.error(
      `Dein Eintrag konnte nicht gespeichert werden / ${error.message}`
    )
  }
}

const EditorDepot = ({ type, mode }) => {
  const { id } = useParams()
  const history = useHistory()

  const entriesQuery = useQuery({
    queryKey: ['getPlaces'],
    queryFn: () => getEntries(),
    onError: () => {
      Alert.error('Die Einträge konnten nicht geladen werden.')
    }
  })

  const depotQuery = useQuery({
    queryKey: ['getMyPlace', 'depot', id],
    queryFn: () => getMyPlace('depot', id),
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

  const createDepotMutation = useMutation({
    mutationFn: async (depot) => {
      const response = await createDepot(depot)
      if (response.properties.id === depot.id) {
        Alert.success(
          `Dein Eintrag <strong>${response.data.name}</strong> wurde erfolgreich gespeichert.`
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

  const handleClear = () => {
    // ???
  }
  const initialValues = getInitialValues(depotQuery.data, type, mode)

  const farms =
    entriesQuery && entriesQuery.data
      ? filterFarms(entriesQuery.data.features)
      : []

  const user = useSelector((state) => state.user.currentUser || {})

  if (mode === 'update' && !depotQuery.data) {
    return <Loading />
  }

  return (
    <div className='entries-editor'>
      <div className='entries-editor-container'>
        <h1>
          {mode === 'create' ? 'Neues Depot eintragen' : 'Depot editieren'}
        </h1>
        <DepotForm
          type={type}
          onSubmit={handleSubmit}
          clearSearch={handleClear}
          farms={farms}
          initialValues={initialValues}
          user={user}
          products={productsQuery.data}
          goals={goalsQuery.data}
          badges={badgesQuery.data}
        />
      </div>
    </div>
  )
}

EditorDepot.propTypes = {
  type: PropTypes.string,
  mode: PropTypes.string
}

EditorDepot.defaultProps = {
  initialValues: {}
}

export default EditorDepot
