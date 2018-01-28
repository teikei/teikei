import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'

const filterByCurrentUser = (places, currentUser) => {
  if (currentUser) {
    return places.filter(
      p => p.ownerships.filter(o => o.user_id === currentUser.id).length > 0
    )
  }
  return []
}

const mapStateToProps = ({ map, user }) => ({
  places: filterByCurrentUser(map.places, user.currentUser)
})

const MyEntriesListContainer = connect(mapStateToProps)(MyEntriesList)

export default MyEntriesListContainer
