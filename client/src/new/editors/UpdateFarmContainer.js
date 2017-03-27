import { connect } from 'react-redux'
import { updateFarm } from './editorActions'
import FarmEditor from './FarmEditor'

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
    title: 'Betrieb editieren',
  })
}

const mapDispatchToProps = dispatch => ({
  onFarmSubmit: (payload) => {debugger ; dispatch(updateFarm(payload))},
})

const UpdateFarmContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FarmEditor)

export default UpdateFarmContainer
