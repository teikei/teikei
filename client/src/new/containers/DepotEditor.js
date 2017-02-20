import { connect } from 'react-redux'
import { createDepot } from '../actions/entry'
import DepotEditor from '../components/editors/DepotEditor'

const mapStateToProps = ({ entry }) => entry

const mapDispatchToProps = dispatch => ({
  onDepotSubmit: payload => dispatch(createDepot(payload)),
})

const DepotEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepotEditor)

export default DepotEditorContainer
