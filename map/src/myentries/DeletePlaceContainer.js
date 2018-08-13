import { connect } from 'react-redux'
import { deletePlace } from '../editors/editorActions'
import DeletePlace from './DeletePlace'

const mapStateToProps = ({ editor }) => ({
  feature: editor.feature
})

const mapDispatchToProps = dispatch => ({
  onDeleteClick: place => dispatch(deletePlace(place))
})

const DeletePlaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeletePlace)

export default DeletePlaceContainer
