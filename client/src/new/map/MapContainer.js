import { connect } from 'react-redux'
import Map from './Map'

const mapStateToProps = ({ map }) => ({ places: map.places })

const mapDispatchToProps = () => ({
})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map)

export default MapContainer
