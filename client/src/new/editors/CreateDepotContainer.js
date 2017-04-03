import { connect } from 'react-redux'
import { createDepot } from './editorActions'
import DepotEditor from './DepotEditor'

const filterFarms = places => places.filter(p => p.type === 'Farm')

const mapStateToProps = ({ editor, map, user }) => {
  const initialValues = editor.place && {
    geocoder: {
      city: editor.place.city,
      address: editor.place.address,
      latitude: Number(editor.place.latitude),
      longitude: Number(editor.place.longitude),
    },
    ...editor.place,
  }

  return ({
    initialValues,
    farms: filterFarms(map.places),
    user: user.currentUser || {},
    title: 'Neues Depot eintragen',
  })
}

const mapDispatchToProps = dispatch => ({
  onDepotSubmit: payload => dispatch(createDepot(payload)),
})

const CreateDepotContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepotEditor)

export default CreateDepotContainer
