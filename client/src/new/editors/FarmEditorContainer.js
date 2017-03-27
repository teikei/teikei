import { connect } from 'react-redux'
import addFarm from './editorActions'
import FarmEditor from './FarmEditor'

const mapStateToProps = ({ editor, user }) => {
  const initialValues = editor.currentPlace && {
    geocoder: {
      city: editor.currentPlace.city,
      address: editor.currentPlace.address,
      latitude: Number(editor.currentPlace.latitude),
      longitude: Number(editor.currentPlace.longitude),
    },
    ...editor.currentPlace,
  }

  return ({
    initialValues,
    editor,
    user: user.currentUser || {},
  })
}

const mapDispatchToProps = dispatch => ({
  handleSubmit: payload => dispatch(addFarm(payload)),
})

const FarmEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FarmEditor)

export default FarmEditorContainer
