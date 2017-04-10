import { connect } from 'react-redux'
import { createDepot, updateDepot, createFarm, updateFarm, createInitiative, updateInitiative } from './editorActions'
import editorCreator from './editorCreator'

const filterFarms = places => places.filter(p => p.type === 'Farm')

const title = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return 'Neuen Betrieb eintragen'
  } else if (type === 'farm' && mode === 'update') {
    return 'Betrieb editieren'
  } else if (type === 'depot' && mode === 'create') {
    return 'Neues Depot eintragen'
  } else if (type === 'depot' && mode === 'update') {
    return 'Depot editieren'
  } else if (type === 'initiative' && mode === 'create') {
    return 'Neue Initiative eintragen'
  } else if (type === 'initiative' && mode === 'update') {
    return 'Initiative editieren'
  }
  return ''
}

const editorAction = (type, mode) => {
  if (type === 'farm' && mode === 'create') {
    return createFarm
  } else if (type === 'farm' && mode === 'update') {
    return updateFarm
  } else if (type === 'depot' && mode === 'create') {
    return createDepot
  } else if (type === 'depot' && mode === 'update') {
    return updateDepot
  } else if (type === 'initiative' && mode === 'create') {
    return createInitiative
  } else if (type === 'initiative' && mode === 'update') {
    return updateInitiative
  }
  return () => {
  }
}

const editorContainer = (type, mode) => {
  const mapStateToProps = ({ editor, map, user }) => {
    const initialValues = editor.place && {
      geocoder: {
        city: editor.place.city,
        address: editor.place.address,
        latitude: Number(editor.place.latitude),
        longitude: Number(editor.place.longitude),
      },
      ...editor.place,
      initiative_goals: editor.place.initiative_goals.toString(),
    }
    return ({
      initialValues,
      farms: filterFarms(map.places),
      user: user.currentUser || {},
      title: title(type, mode),
    })
  }

  const mapDispatchToProps = dispatch => ({
    onPlaceSubmit: payload => dispatch(editorAction(type, mode)(payload)),
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(editorCreator(type))
}

export default editorContainer
