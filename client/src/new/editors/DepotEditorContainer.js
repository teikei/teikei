import { connect } from 'react-redux'
import { createDepot } from './editorActions'
import DepotEditor from './DepotEditor'

const extractFarmOptions = places => places.filter(p => p.type === 'Farm')
const mapStateToProps = ({ editor, map }) => ({
  initialValues: editor.currentPlace,
  editor,
  farms: extractFarmOptions(map.places),
})

const mapDispatchToProps = dispatch => ({
  handleSubmit: payload => dispatch(createDepot(payload)),
})

const DepotEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepotEditor)

export default DepotEditorContainer
