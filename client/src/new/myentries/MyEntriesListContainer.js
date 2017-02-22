import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'
import { beginAddDepot, beginAddFarm, editPlace, deletePlace } from '../editors/editorActions'

// TODO: filter by current user
const filterOwnedByCurrentUser = places => places

const mapStateToProps = ({ map }) => ({
  places: filterOwnedByCurrentUser(map.places),
})

const mapDispatchToProps = dispatch => ({
  onEditClick: p => dispatch(editPlace(p)),
  onAddDepotClick: () => dispatch(beginAddDepot()),
  onAddFarmClick: () => dispatch(beginAddFarm()),
  onDeleteClick: p => dispatch(deletePlace(p)),
})

const MyEntriesListContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyEntriesList)

export default MyEntriesListContainer
