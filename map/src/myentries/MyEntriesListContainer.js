import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'

const mapStateToProps = ({ map }) => ({
  features: map.myPlaces
})

const MyEntriesListContainer = connect(mapStateToProps)(MyEntriesList)

export default MyEntriesListContainer
