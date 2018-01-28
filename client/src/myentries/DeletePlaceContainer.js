import { connect } from 'react-redux'
import { deletePlace } from '../editors/editorActions'
import DeletePlace from './DeletePlace'

const mapStateToProps = ({ editor }) => ({
  place: editor.place
})

const mapDispatchToProps = dispatch => ({
  onDeleteClick: id => dispatch(deletePlace(id))
})

const DeletePlaceContainer = connect(mapStateToProps, mapDispatchToProps)(
  DeletePlace
)

export default DeletePlaceContainer
