import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'
import { beginAddDepot, beginAddFarm, editPlace, deletePlace } from '../editors/editorActions'

const filterOwnedByCurrentUser = (places, currentUser) => {
  if (currentUser) {
    return places.filter(p =>
      (p.ownerships.filter(o => o.user_id === currentUser.id).length > 0),
    )
  }
  return []
}

const mapStateToProps = ({ map, user }) => ({
  places: filterOwnedByCurrentUser(map.places, user.currentUser),
})

const mapDispatchToProps = dispatch => ({
  onEditClick: p => dispatch(editPlace(p)),
  onDeleteClick: p => dispatch(deletePlace(p)),
})

const MyEntriesListContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyEntriesList)

export default MyEntriesListContainer
