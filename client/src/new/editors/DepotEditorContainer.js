import { connect } from 'react-redux'
import { createDepot } from './editorActions'
import DepotEditor from './DepotEditor'

const mapStateToProps = ({ editor }) => editor

const mapDispatchToProps = dispatch => ({
  onDepotSubmit: payload => dispatch(createDepot(payload)),
})

const DepotEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepotEditor)

export default DepotEditorContainer
