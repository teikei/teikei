import { connect } from 'react-redux'
import {
  createDepot,
  updateDepot,
  createFarm,
  updateFarm,
  createInitiative,
  updateInitiative
} from './editorActions'
import editorCreator from './editorCreator'

const filterFarms = places => places.filter(p => p.type === 'Farm')

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

const editorContainer = (type, mode) => {
  const mapStateToProps = ({ editor, map, user }) => {
    const initialValues = editor.place && {
      geocoder: {
        city: editor.place.city,
        address: editor.place.address,
        latitude: Number(editor.place.latitude),
        longitude: Number(editor.place.longitude)
      },
      ...editor.place
    }
    return {
      initialValues,
      farms: filterFarms(map.places),
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
  )(editorCreator(type))
}

export default editorContainer
