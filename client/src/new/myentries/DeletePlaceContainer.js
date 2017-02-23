import { connect } from 'react-redux'
import { deletePlace } from '../editors/editorActions'
import { EMPTY_PLACE } from '../editors/editorReducer'
import DeletePlace from './DeletePlace'

const mapStateToProps = ({ editor }) => ({
  place: editor.currentPlace ? editor.currentPlace : EMPTY_PLACE,
})

const mapDispatchToProps = dispatch => ({
  onDeleteClick: id => dispatch(deletePlace(id)),
})

const DeletePlaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DeletePlace)

export default DeletePlaceContainer
