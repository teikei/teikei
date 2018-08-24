import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { joiInitialValues } from '@teikei/schemas'

import {
  createDepot,
  updateDepot,
  createFarm,
  updateFarm,
  createInitiative,
  updateInitiative
} from './duck'
import DepotForm from './components/DepotForm'
import FarmForm from './components/FarmForm'
import InitiativeForm from './components/InitiativeForm'
import Loading from '../components/Loading'
import { getLatitude, getLongitude } from '../common/geoJsonUtils'

const Form = ({
  type,
  initialValues,
  onPlaceSubmit,
  farms,
  user,
  products,
  goals
}) => {
  if (type === 'depot') {
    return (
      <DepotForm
        onSubmit={onPlaceSubmit}
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
        initialValues={initialValues}
        user={user}
        products={products}
      />
    )
  }
  if (type === 'initiative') {
    return (
      <InitiativeForm
        onSubmit={onPlaceSubmit}
        initialValues={initialValues}
        user={user}
        goals={goals}
      />
    )
  }
  return ''
}

Form.propTypes = {
  type: PropTypes.oneOf(['depot', 'farm', 'initiative']).isRequired,
  onPlaceSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
  products: PropTypes.array.isRequired
}

Form.defaultProps = {
  initialValues: {}
}

const editor = type => {
  const Editor = ({
    initialValues,
    onPlaceSubmit,
    farms,
    user,
    title,
    products,
    goals,
    feature
  }) => {
    return (
      (feature && (
        <div className="entries-editor">
          <div className="entries-editor-container">
            <h1>{title}</h1>

            <Form
              type={type}
              onPlaceSubmit={onPlaceSubmit}
              farms={farms}
              initialValues={initialValues}
              user={user}
              products={products}
              goals={goals}
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
    products: PropTypes.array.isRequired
  }

  Editor.defaultProps = {
    initialValues: {}
  }

  return Editor
}

const filterFarms = features => {
  const farms = features.filter(p => p.properties.type === 'Farm')
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
              farms: feature.properties.farms.map(
                ({ properties: { id, name } }) => ({
                  id,
                  name
                })
              )
            }),
            ...(feature.properties.goals && {
              goals: feature.properties.goals.map(({ id }) => id)
            }),
            latitude: getLatitude(feature),
            longitude: getLongitude(feature)
          },
          ['id', ..._.keys(joiInitialValues[type])]
        )
      : {}
  } else if (mode === 'create') {
    return joiInitialValues[type]
  }
  return () => {}
}

const editorContainer = (type, mode) => {
  const mapStateToProps = ({ editor, map, user }) => {
    return {
      feature: editor.feature,
      initialValues: initialValues(editor.feature, type, mode),
      farms: map.data ? filterFarms(map.data.features) : [],
      products: editor.products,
      goals: editor.goals,
      user: user.currentUser || {},
      title: title(type, mode)
    }
  }

  const mapDispatchToProps = dispatch => ({
    onPlaceSubmit: payload => dispatch(editorAction(type, mode)(payload))
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(editor(type))
}

export default editorContainer
