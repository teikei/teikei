import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect, useDispatch } from 'react-redux'
import _ from 'lodash'
import { initialValues as joiInitialValues } from '../../common/validation'

import {
  createDepot,
  updateDepot,
  createFarm,
  updateFarm,
  createInitiative,
  updateInitiative,
  initCreateFeature,
  fetchProducts,
  fetchBadges,
  initEditFeature,
  fetchGoals,
} from './duck'
import DepotForm from './components/DepotForm'
import FarmForm from './components/FarmForm'
import InitiativeForm from './components/InitiativeForm'
import Loading from '../../components/Loading/index'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { clearSearch } from '../Search/duck'
import { requestAllPlaces } from '../Map/duck'
import { useParams } from 'react-router-dom'

const Form = ({
  type,
  initialValues,
  onPlaceSubmit,
  clearSearch,
  farms,
  user,
  products,
  goals,
  badges,
}) => {
  if (type === 'depot') {
    return (
      <DepotForm
        onSubmit={onPlaceSubmit}
        clearSearch={clearSearch}
        farms={farms}
        initialValues={initialValues}
        user={user}
      />
    )
  }
  if (type === 'farm') {
    return (
      <FarmForm
        onSubmit={onPlaceSubmit}
        clearSearch={clearSearch}
        initialValues={initialValues}
        user={user}
        products={products}
        badges={badges}
      />
    )
  }
  if (type === 'initiative') {
    return (
      <InitiativeForm
        onSubmit={onPlaceSubmit}
        clearSearch={clearSearch}
        initialValues={initialValues}
        user={user}
        goals={goals}
        badges={badges}
      />
    )
  }
  return ''
}

Form.propTypes = {
  type: PropTypes.oneOf(['depot', 'farm', 'initiative']).isRequired,
  onPlaceSubmit: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
  products: PropTypes.array.isRequired,
}

Form.defaultProps = {
  initialValues: {},
}

const editor = (type) => {
  const Editor = ({
    initialValues,
    onPlaceSubmit,
    clearSearch,
    farms,
    user,
    title,
    products,
    goals,
    badges,
    feature,
  }) => {
    return (
      (feature && (
        <div className="entries-editor">
          <div className="entries-editor-container">
            <h1>{title}</h1>

            <Form
              type={type}
              onPlaceSubmit={onPlaceSubmit}
              clearSearch={clearSearch}
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

  Editor.propTypes = {
    onPlaceSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape(),
    user: PropTypes.shape().isRequired,
    farms: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
    goals: PropTypes.array.isRequired,
    badges: PropTypes.array.isRequired,
  }

  Editor.defaultProps = {
    initialValues: {},
  }

  return Editor
}

const filterFarms = (features) => {
  const farms = features.filter((p) => p.properties.type === 'Farm')
  return farms.map(({ properties: { id, name } }) => ({ id, name }))
}

const title = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return 'Neuen Betrieb eintragen'
  }
  if (type === 'farm' && mode === 'update') {
    return 'Betrieb editieren'
  }
  if (type === 'depot' && mode === 'create') {
    return 'Neues Depot eintragen'
  }
  if (type === 'depot' && mode === 'update') {
    return 'Depot editieren'
  }
  if (type === 'initiative' && mode === 'create') {
    return 'Neue Initiative eintragen'
  }
  if (type === 'initiative' && mode === 'update') {
    return 'Initiative editieren'
  }
  return ''
}

const editorAction = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return createFarm
  }
  if (type === 'farm' && mode === 'update') {
    return updateFarm
  }
  if (type === 'depot' && mode === 'create') {
    return createDepot
  }
  if (type === 'depot' && mode === 'update') {
    return updateDepot
  }
  if (type === 'initiative' && mode === 'create') {
    return createInitiative
  }
  if (type === 'initiative' && mode === 'update') {
    return updateInitiative
  }
  return () => {}
}

const initialValues = (feature, type, mode) => {
  if (mode === 'update') {
    return feature
      ? _.pick(
          {
            ...feature.properties,
            ...(feature.properties.farms && {
              farms: feature.properties.farms.features.map(
                ({ properties: { id, name } }) => ({
                  id,
                  name,
                })
              ),
            }),
            ...(feature.properties.goals && {
              goals: feature.properties.goals.map(({ id }) => id),
            }),
            ...(feature.properties.products && {
              products: feature.properties.products.map(({ id }) => id),
            }),
            ...(feature.properties.badges && {
              badges: feature.properties.badges.map(({ id }) => id),
            }),
            latitude: getLatitude(feature),
            longitude: getLongitude(feature),
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

const EditorContainer = ({ type, mode }) => {
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
    if (type === 'depot' && mode === 'create') {
      dispatch(initCreateFeature())
      dispatch(requestAllPlaces()) // fetch data for farms select
    }
    if (type === 'depot' && mode === 'update') {
      dispatch(initEditFeature(id, 'depot'))
      dispatch(requestAllPlaces()) // fetch data for farms select
    }
    if (type === 'initiative' && mode === 'create') {
      dispatch(initCreateFeature())
      dispatch(fetchGoals())
      dispatch(fetchBadges())
    }
    if (type === 'initiative' && mode === 'update') {
      dispatch(initEditFeature(id, 'initiative'))
      dispatch(fetchGoals())
      dispatch(fetchBadges())
    }
  }, [])
  const mapStateToProps = ({ editor, map, user }) => {
    return {
      feature: editor.feature,
      initialValues: initialValues(editor.feature, type, mode),
      farms: map.data ? filterFarms(map.data.features) : [],
      products: editor.products,
      goals: editor.goals,
      badges: editor.badges,
      user: user.currentUser || {},
      title: title(type, mode),
    }
  }

  const mapDispatchToProps = (dispatch) => ({
    onPlaceSubmit: (payload) => dispatch(editorAction(type, mode)(payload)),
    clearSearch: (payload) => dispatch(clearSearch(payload)),
  })

  return connect(mapStateToProps, mapDispatchToProps)(editor(type))
}

EditorContainer.propTypes = {
  type: PropTypes.string,
  mode: PropTypes.string,
}

export default EditorContainer
