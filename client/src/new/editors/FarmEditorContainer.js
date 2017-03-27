import { connect } from 'react-redux'
import { saveFarm } from './editorActions'
import FarmEditor from './FarmEditor'

const mapStateToProps = ({ editor, user }) => {
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
    user: user.currentUser || {},
  })
}

const mapDispatchToProps = dispatch => ({
  handleSubmit: payload => dispatch(saveFarm(payload)),
})

const FarmEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FarmEditor)

export default FarmEditorContainer
