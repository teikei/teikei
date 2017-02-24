import { connect } from 'react-redux'
import { config } from '../App';
import Map from './Map'

const getPosition = () => {
  const center = config.center
  return [center.lat, center.lon]
}

const getZoom = () => config.zoom

const getApiKey = () => config.apiKey

const mapStateToProps = ({ map }) => ({
  places: map.places,
  position: getPosition(),
  zoom: getZoom(),
  apiKey: getApiKey(),
})

const mapDispatchToProps = () => ({
})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map)

export default MapContainer
