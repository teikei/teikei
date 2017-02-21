import { connect } from 'react-redux'
import addFarm from './editorActions'
import FarmEditor from './FarmEditor'

const mapStateToProps = ({ entry }) => entry

const mapDispatchToProps = dispatch => ({
  handleSubmit: payload => dispatch(addFarm(payload)),
})

const FarmEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FarmEditor)

export default FarmEditorContainer
