import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'
import featureToPlace from '../common/migrationUtils'

const mapStateToProps = ({ map }) => ({
  places: map.myPlaces.features
    ? map.myPlaces.features.map(featureToPlace)
    : map.myPlaces
})

const MyEntriesListContainer = connect(mapStateToProps)(MyEntriesList)

export default MyEntriesListContainer
