import { connect } from 'react-redux'
import addFarm from './editorActions'
import FarmEditor from './FarmEditor'

const mapStateToProps = ({ editor }) => ({
  initialValues: editor.currentPlace,
  editor,
})

const mapDispatchToProps = dispatch => ({
  handleSubmit: payload => dispatch(addFarm(payload)),
})

const FarmEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FarmEditor)

export default FarmEditorContainer
