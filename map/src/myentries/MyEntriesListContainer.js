import { connect } from 'react-redux'
import MyEntriesList from './MyEntriesList'

const mapStateToProps = ({ map }) => {
  console.log("map", map);

  return ({
    features: map.myentries.features
  })
}

const MyEntriesListContainer = connect(mapStateToProps)(MyEntriesList)

export default MyEntriesListContainer
