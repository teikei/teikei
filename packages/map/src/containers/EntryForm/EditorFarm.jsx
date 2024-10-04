import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash'
import { initialValues as joiInitialValues } from '../../common/validation'

import {
  createFarm,
  fetchBadges,
  fetchProducts,
  initCreateFeature,
  initEditFeature,
  updateFarm
} from './duck'
import FarmForm from './components/FarmForm'
import Loading from '../../components/Loading/index'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { clearSearch } from '../Search/duck'
import { useParams } from 'react-router-dom'

const filterFarms = (features) => {
  const farms = features.filter((p) => p.properties.type === 'Farm')
  return farms.map(({ properties: { id, name } }) => ({ id, name }))
}

const editorAction = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return createFarm
  }
  if (type === 'farm' && mode === 'update') {
    return updateFarm
  }
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
  if (mode === 'create') {
    return joiInitialValues[type]
  }
  return () => {}
}

const getTitle = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return 'Neuen Betrieb eintragen'
  }
  if (type === 'farm' && mode === 'update') {
    return 'Betrieb editieren'
  }
  return ''
}

const EditorFarm = ({ type, mode }) => {
  const { id } = useParams()
  const dispatch = useDispatch()
  useEffect(() => {
    if (type === 'farm' && mode === 'create') {
      dispatch(initCreateFeature())
      dispatch(fetchProducts())
      dispatch(fetchBadges())
    }
    if (type === 'farm' && mode === 'update') {
      dispatch(initEditFeature(id, 'farm'))
      dispatch(fetchProducts())
      dispatch(fetchBadges())
    }
  }, [])
  const submit = useCallback(
    (payload) => dispatch(editorAction(type, mode)(payload)),
    [dispatch, type, mode]
  )
  const clear = useCallback(
    (payload) => dispatch(clearSearch(payload)),
    [dispatch, type, mode]
  )
  const feature = useSelector((state) => state.editor.feature)
  const initialValues = useSelector((state) =>
    getInitialValues(state.editor.feature, type, mode)
  )
  const farms = useSelector((state) =>
    state.map.data ? filterFarms(state.map.data.features) : []
  )
  const products = useSelector((state) => state.editor.products)
  const goals = useSelector((state) => state.editor.goals)
  const badges = useSelector((state) => state.editor.badges)
  const user = useSelector((state) => state.user.currentUser || {})
  return (
    (feature && (
      <div className='entries-editor'>
        <div className='entries-editor-container'>
          <h1>{getTitle(type, mode)}</h1>
          <FarmForm
            type={type}
            onPlaceSubmit={submit}
            clearSearch={clear}
            farms={farms}
            initialValues={initialValues}
            user={user}
            products={products}
            goals={goals}
            badges={badges}
          />
        </div>
      </div>
    )) || <Loading />
  )
}

EditorFarm.propTypes = {
  type: PropTypes.string,
  mode: PropTypes.string
}

EditorFarm.defaultProps = {
  initialValues: {}
}

export default EditorFarm
